import { corsHeaders, htmlResponse, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { escapeHtml, siteUrl } from '../_shared/email.ts';

function wantsJson(req: Request, url: URL): boolean {
  if (url.searchParams.get('format') === 'json') return true;
  const accept = req.headers.get('accept') || '';
  return accept.includes('application/json') && !accept.includes('text/html');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token') || '';
    if (!token && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      token = String(body.token || '');
    }
    if (!token) {
      return htmlResponse('<h1>Missing unsubscribe token</h1>', 400);
    }

    const supabase = adminClient();
    const { data, error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('unsubscribe_token', token)
      .select('email')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return htmlResponse('<h1>Invalid unsubscribe link</h1>', 404);
    }

    if (wantsJson(req, url)) {
      return jsonResponse({ ok: true });
    }

    const redirect = `${siteUrl()}/?unsubscribed=1`;
    return new Response(null, {
      status: 303,
      headers: { ...corsHeaders, Location: redirect },
    });
  } catch (error) {
    const message = escapeHtml(error instanceof Error ? error.message : 'Error');
    return htmlResponse(`<h1>Unsubscribe failed</h1><p>${message}</p>`, 500);
  }
});
