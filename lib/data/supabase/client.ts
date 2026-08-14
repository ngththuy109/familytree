// Client Supabase — nạp ĐỘNG @supabase/supabase-js để không vào bundle bản local.
import type { SupabaseClient } from '@supabase/supabase-js';

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return Promise.reject(new Error('Chưa cấu hình Supabase (thiếu env).'));
    }
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
    );
  }
  return clientPromise;
}
