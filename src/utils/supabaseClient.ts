import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Memory } from '@/types';

const STORAGE_KEY_SUPABASE_URL = 'malaysia_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'malaysia_supabase_key';

// Default to user's known Supabase credentials if available
const DEFAULT_SUPABASE_URL = 'https://rgqjuxpqnkhbfpjugwrs.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncWp1eHBxbmtoYmZwanVnd3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTU0NDUsImV4cCI6MjA5OTUzMTQ0NX0.BTSqX2h5OV2HzwGW1eCjThi4pztT5pIN4p5mmIwM2X0';

export function getSupabaseConfig(): { url: string; key: string } {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY,
    };
  }
  return {
    url:
      localStorage.getItem(STORAGE_KEY_SUPABASE_URL) ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      DEFAULT_SUPABASE_URL,
    key:
      localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      DEFAULT_SUPABASE_KEY,
  };
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    cachedUrl = url;
    cachedKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Supabase client init error:', err);
    return null;
  }
}

/**
 * Upload a photo directly to Supabase Storage bucket 'images'
 */
export async function uploadToSupabaseStorage(
  file: File,
  bucketName = 'images'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not configured' };
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `memory_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await client.storage
      .from(bucketName)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicData } = client.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return { success: true, url: publicData.publicUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Storage upload error';
    return { success: false, error: message };
  }
}

/**
 * Sync memories array to Supabase database table 'memories'
 */
export async function syncMemoriesToSupabase(memories: Memory[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Attempt upsert into memories table
    const formatted = memories.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      location: m.location,
      date: m.date,
      description: m.description,
      rating: m.rating,
      photos: m.photos,
      tags: m.tags,
      song: m.song,
      unforgettable: m.unforgettable,
      created_at: m.createdAt,
    }));

    const { error } = await client
      .from('memories')
      .upsert(formatted, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase DB sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync catch:', err);
    return false;
  }
}

/**
 * Fetch memories from Supabase database table
 */
export async function fetchMemoriesFromSupabase(): Promise<Memory[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('memories')
      .select('*')
      .order('date', { ascending: false });

    if (error || !data) return null;

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      type: d.type,
      location: d.location,
      date: d.date,
      description: d.description,
      rating: Number(d.rating),
      photos: d.photos || [],
      tags: d.tags || [],
      song: d.song,
      unforgettable: Boolean(d.unforgettable),
      createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    }));
  } catch {
    return null;
  }
}
