import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';
import { findChronicle } from '../_shared/chronicles.ts';
import {
  RateLimitError,
  assertWithinLimit,
  clientIp,
  recordRateEvent,
} from '../_shared/rateLimit.ts';

const VISITOR_RE = /^[A-Za-z0-9_-]{8,80}$/;
const MAX_PER_IP_HOUR = 60;
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
    const chronicleId = String(body.chronicleId || '').trim();
    const visitorKey = String(body.visitorKey || '').trim();
    const vote = String(body.vote || '').trim();

    if (!findChronicle(chronicleId)) {
      return jsonResponse({ error: 'Unknown chronicle' }, 400);
    }
    if (!VISITOR_RE.test(visitorKey)) {
      return jsonResponse({ error: 'Invalid visitorKey' }, 400);
    }
    if (vote !== 'like' && vote !== 'dislike') {
      return jsonResponse({ error: 'vote must be like or dislike' }, 400);
    }

    const supabase = adminClient();
    const ip = clientIp(req);
    try {
      await assertWithinLimit(supabase, `react:ip:${ip}`, MAX_PER_IP_HOUR, HOUR_MS);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return jsonResponse({ error: error.message }, 429);
      }
      throw error;
    }

    const { error } = await supabase.from('reactions').upsert(
      {
        chronicle_id: chronicleId,
        visitor_key: visitorKey,
        vote,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'chronicle_id,visitor_key' }
    );
    if (error) throw error;

    await recordRateEvent(supabase, `react:ip:${ip}`);

    const { data: counts } = await supabase
      .from('reaction_counts')
      .select('likes, dislikes')
      .eq('chronicle_id', chronicleId)
      .maybeSingle();

    return jsonResponse({
      ok: true,
      likes: counts?.likes ?? 0,
      dislikes: counts?.dislikes ?? 0,
      vote,
      chronicleId,
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'React failed' }, 500);
  }
});
