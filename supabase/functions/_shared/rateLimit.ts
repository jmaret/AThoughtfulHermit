import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const first = forwarded.split(',')[0]?.trim();
  return first || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown';
}

export async function countRecent(
  supabase: SupabaseClient,
  key: string,
  sinceIso: string
): Promise<number> {
  const { count } = await supabase
    .from('send_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('email', key)
    .gte('sent_at', sinceIso);
  return count ?? 0;
}

export async function recordRateEvent(supabase: SupabaseClient, key: string): Promise<void> {
  await supabase.from('send_rate_limits').insert({ email: key });
}

export async function assertWithinLimit(
  supabase: SupabaseClient,
  key: string,
  max: number,
  windowMs: number
): Promise<void> {
  const since = new Date(Date.now() - windowMs).toISOString();
  const used = await countRecent(supabase, key, since);
  if (used >= max) {
    throw new RateLimitError('Rate limit reached. Try again later.');
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
