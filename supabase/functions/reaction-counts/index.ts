import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { adminClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const url = new URL(req.url);
    const chronicleId = url.searchParams.get('chronicleId');
    const supabase = adminClient();

    if (chronicleId) {
      const { data, error } = await supabase
        .from('reaction_counts')
        .select('chronicle_id, likes, dislikes')
        .eq('chronicle_id', chronicleId)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({
        counts: {
          [chronicleId]: {
            likes: data?.likes ?? 0,
            dislikes: data?.dislikes ?? 0,
          },
        },
      });
    }

    const { data, error } = await supabase.from('reaction_counts').select('chronicle_id, likes, dislikes');
    if (error) throw error;
    const counts: Record<string, { likes: number; dislikes: number }> = {};
    for (const row of data ?? []) {
      counts[row.chronicle_id] = { likes: row.likes, dislikes: row.dislikes };
    }
    return jsonResponse({ counts });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Counts failed' }, 500);
  }
});
