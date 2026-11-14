import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import {
  articleEmailHtml,
  functionsBaseUrl,
  sendResendEmail,
} from '../_shared/email.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PER_HOUR = 3;

type ChroniclePayload = {
  id: string;
  title: string;
  series: string;
  excerpts: string[];
};

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
    const chronicle = body.chronicle as ChroniclePayload | undefined;

    if (!EMAIL_RE.test(email)) {
      return jsonResponse({ error: 'Enter a valid email address.' }, 400);
    }
    if (!chronicle?.id || !chronicle.title || !Array.isArray(chronicle.excerpts)) {
      return jsonResponse({ error: 'Missing chronicle payload.' }, 400);
    }

    const supabase = adminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('send_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('sent_at', oneHourAgo);

    if ((count ?? 0) >= MAX_PER_HOUR) {
      return jsonResponse({ error: 'Rate limit reached. Try again later.' }, 429);
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
      series: chronicle.series || 'Chronicle',
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

    await supabase.from('send_rate_limits').insert({ email });

    return jsonResponse({ ok: true, message: 'Article sent.' });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Send failed' }, 500);
  }
});
