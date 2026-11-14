import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';

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

    if (!chronicleId || !visitorKey) {
      return jsonResponse({ error: 'Missing chronicleId or visitorKey' }, 400);
    }
    if (vote !== 'like' && vote !== 'dislike') {
      return jsonResponse({ error: 'vote must be like or dislike' }, 400);
    }

    const supabase = adminClient();
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
    });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'React failed' }, 500);
  }
});
