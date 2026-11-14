import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { functionsBaseUrl, sendResendEmail } from '../_shared/email.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const cronSecret = Deno.env.get('CRON_SECRET');
    const provided = req.headers.get('x-cron-secret');
    if (!cronSecret || provided !== cronSecret) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabase = adminClient();
    const { data: edition, error: editionError } = await supabase
      .from('weekly_editions')
      .select('*')
      .is('sent_at', null)
      .order('week_of', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (editionError) throw editionError;
    if (!edition) {
      return jsonResponse({ ok: true, message: 'No unsent weekly edition.' });
    }

    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email, unsubscribe_token')
      .eq('status', 'active');

    if (subError) throw subError;
    const list = subscribers ?? [];
    if (list.length === 0) {
      return jsonResponse({ ok: true, message: 'No active subscribers.', editionId: edition.id });
    }

    let sent = 0;
    const failures: string[] = [];

    for (const subscriber of list) {
      const unsub = `${functionsBaseUrl()}/unsubscribe?token=${subscriber.unsubscribe_token}`;
      const html = String(edition.email_html).includes('Unsubscribe')
        ? edition.email_html
        : `${edition.email_html}<p style="text-align:center;font-family:Georgia,serif;font-size:12px;"><a href="${unsub}">Unsubscribe</a></p>`;

      const result = await sendResendEmail({
        to: subscriber.email,
        subject: edition.subject,
        html,
      });
      if (result.error) {
        failures.push(`${subscriber.email}: ${result.error}`);
      } else {
        sent += 1;
      }
    }

    // Only mark complete when every active subscriber received the email.
    if (sent > 0 && failures.length === 0) {
      await supabase
        .from('weekly_editions')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', edition.id);
    }

    return jsonResponse({
      ok: failures.length === 0,
      editionId: edition.id,
      sent,
      failed: failures.length,
      markedSent: sent > 0 && failures.length === 0,
      failures: failures.slice(0, 10),
      message:
        failures.length === 0
          ? 'Weekly edition sent.'
          : 'Partial or total send failure; edition left unsent for retry.',
    }, failures.length === 0 ? 200 : 502);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Weekly send failed' }, 500);
  }
});
