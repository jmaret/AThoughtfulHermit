import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { functionsBaseUrl, sendResendEmail, simpleNoticeEmailHtml } from '../_shared/email.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { email } = await req.json();
    const normalized = String(email || '')
      .trim()
      .toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      return jsonResponse({ error: 'Enter a valid email address.' }, 400);
    }

    const supabase = adminClient();
    const { data: existing } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', normalized)
      .maybeSingle();

    let confirmToken = existing?.confirm_token as string | undefined;
    let unsubscribeToken = existing?.unsubscribe_token as string | undefined;

    if (existing?.status === 'active') {
      return jsonResponse({ ok: true, status: 'active', message: 'You are already subscribed.' });
    }

    if (existing) {
      const { data, error } = await supabase
        .from('subscribers')
        .update({ status: 'pending', confirmed_at: null })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      confirmToken = data.confirm_token;
      unsubscribeToken = data.unsubscribe_token;
    } else {
      const { data, error } = await supabase
        .from('subscribers')
        .insert({ email: normalized, status: 'pending' })
        .select('*')
        .single();
      if (error) throw error;
      confirmToken = data.confirm_token;
      unsubscribeToken = data.unsubscribe_token;
    }

    const confirmUrl = `${functionsBaseUrl()}/confirm?token=${confirmToken}`;
    const html = simpleNoticeEmailHtml(
      'Confirm your subscription',
      'One quiet click confirms you want the weekly article of the week from AThoughtfulHermit.',
      confirmUrl,
      'Confirm subscription'
    );

    const sent = await sendResendEmail({
      to: normalized,
      subject: 'Confirm your AThoughtfulHermit subscription',
      html,
    });
    if (sent.error) {
      return jsonResponse({ error: sent.error }, 502);
    }

    return jsonResponse({
      ok: true,
      status: 'pending',
      message: 'Check your email to confirm your subscription.',
      unsubscribeToken,
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Subscribe failed' }, 500);
  }
});
