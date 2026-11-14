import { corsHeaders, htmlResponse, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { siteUrl } from '../_shared/email.ts';

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

    if (req.headers.get('accept')?.includes('application/json')) {
      return jsonResponse({ ok: true, email: data.email });
    }

    return htmlResponse(`<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Subscribed</title></head>
<body style="font-family:Georgia,serif;background:#1c1612;color:#fcf6ec;padding:40px;text-align:center;">
  <h1>You are subscribed</h1>
  <p>Weekly articles of the week will arrive quietly.</p>
  <p><a href="${siteUrl()}/" style="color:#d4a04a;">Return to AThoughtfulHermit</a></p>
</body></html>`);
  } catch (error) {
    return htmlResponse(`<h1>Confirmation failed</h1><p>${error instanceof Error ? error.message : 'Error'}</p>`, 500);
  }
});
