/** Public free-tier config. Fill Supabase values after project creation. */
const ATH_CONFIG = {
  siteUrl: 'https://jmaret.github.io/AThoughtfulHermit',
  /** e.g. https://xxxx.supabase.co */
  supabaseUrl: 'https://fcfeesigrxqpbvlgqguh.supabase.co',
  /** anon / public key only — never the service role key */
  supabaseAnonKey: 'sb_publishable_RvmrwBoyqEYBxNO2Ue9BTQ_iWz0hZr4',
  /**
   * When true and supabaseUrl is empty, engagement UI stays visible but
   * calls fail with a setup message instead of silent no-ops.
   */
  engagementEnabled: true,
};
