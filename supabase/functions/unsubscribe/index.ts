import { corsHeaders, htmlResponse, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { siteUrl } from '../_shared/email.ts';

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

    if (req.headers.get('accept')?.includes('application/json')) {
      return jsonResponse({ ok: true });
    }

    return htmlResponse(`<!DOCTYPE html>
<html><head><meta charset="utf-8" /><title>Unsubscribed</title></head>
<body style="font-family:Georgia,serif;background:#1c1612;color:#fcf6ec;padding:40px;text-align:center;">
  <h1>You are unsubscribed</h1>
  <p>No more weekly emails will be sent to this address.</p>
  <p><a href="${siteUrl()}/" style="color:#d4a04a;">Return to AThoughtfulHermit</a></p>
</body></html>`);
  } catch (error) {
    return htmlResponse(`<h1>Unsubscribe failed</h1><p>${error instanceof Error ? error.message : 'Error'}</p>`, 500);
  }
});
