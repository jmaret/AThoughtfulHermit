import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { findChronicle } from '../_shared/chronicles.ts';
import {
  articleEmailHtml,
  functionsBaseUrl,
  sendResendEmail,
} from '../_shared/email.ts';
import {
  RateLimitError,
  assertWithinLimit,
  clientIp,
  recordRateEvent,
} from '../_shared/rateLimit.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_EMAIL_HOUR = 3;
const MAX_PER_IP_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const chronicleId = String(body.chronicleId || body.chronicle?.id || '').trim();

    if (!EMAIL_RE.test(email)) {
      return jsonResponse({ error: 'Enter a valid email address.' }, 400);
    }

    const chronicle = findChronicle(chronicleId);
    if (!chronicle) {
      return jsonResponse({ error: 'Unknown chronicle.' }, 400);
    }

    const supabase = adminClient();
    const ip = clientIp(req);

    try {
      await assertWithinLimit(supabase, `send-now:email:${email}`, MAX_PER_EMAIL_HOUR, HOUR_MS);
      await assertWithinLimit(supabase, `send-now:ip:${ip}`, MAX_PER_IP_HOUR, HOUR_MS);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return jsonResponse({ error: error.message }, 429);
      }
      throw error;
    }

    let unsubscribeUrl: string | undefined;
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('unsubscribe_token, status')
      .eq('email', email)
      .maybeSingle();
    if (subscriber?.unsubscribe_token) {
      unsubscribeUrl = `${functionsBaseUrl()}/unsubscribe?token=${subscriber.unsubscribe_token}`;
    }

    const html = articleEmailHtml({
      title: chronicle.title,
      series: chronicle.series,
      excerpts: chronicle.excerpts,
      unsubscribeUrl,
    });

    const sent = await sendResendEmail({
      to: email,
      subject: chronicle.title,
      html,
    });
    if (sent.error) {
      return jsonResponse({ error: sent.error }, 502);
    }

    await recordRateEvent(supabase, `send-now:email:${email}`);
    await recordRateEvent(supabase, `send-now:ip:${ip}`);

    return jsonResponse({ ok: true, message: 'Article sent.' });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Send failed' }, 500);
  }
});
