import { corsHeaders, htmlResponse, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { escapeHtml, siteUrl } from '../_shared/email.ts';

function wantsJson(req: Request, url: URL): boolean {
  if (url.searchParams.get('format') === 'json') return true;
  const accept = req.headers.get('accept') || '';
  // Only JSON when the client prefers JSON over HTML (API callers).
  return accept.includes('application/json') && !accept.includes('text/html');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token') || '';
    if (!token) {
      return htmlResponse('<h1>Missing confirmation token</h1>', 400);
    }

    const supabase = adminClient();
    const { data, error } = await supabase
      .from('subscribers')
      .update({ status: 'active', confirmed_at: new Date().toISOString() })
      .eq('confirm_token', token)
      .select('email')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return htmlResponse('<h1>Invalid or expired confirmation link</h1>', 404);
    }

    if (wantsJson(req, url)) {
      return jsonResponse({ ok: true, email: data.email });
    }

    // Browser / email-client clicks: hard redirect (meta-refresh is unreliable).
    const redirect = `${siteUrl()}/?subscribed=1`;
    return new Response(null, {
      status: 303,
      headers: { ...corsHeaders, Location: redirect },
    });
  } catch (error) {
    const message = escapeHtml(error instanceof Error ? error.message : 'Error');
    return htmlResponse(`<h1>Confirmation failed</h1><p>${message}</p>`, 500);
  }
});
