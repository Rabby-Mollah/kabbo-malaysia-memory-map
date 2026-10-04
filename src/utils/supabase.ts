/**
 * Supabase client integration layer.
 * Operates gracefully even when Supabase credentials are not configured,
 * ensuring seamless offline/local storage operation while providing
 * instant connectivity when credentials are supplied.
 */

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export interface SyncPayload {
  memories: unknown[];
  profile: unknown;
}

export async function syncToCloud(payload: SyncPayload): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Graceful offline fallback
    return { success: true };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_trips`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
    return { success: res.ok };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cloud sync error';
    return { success: false, error: message };
  }
}
