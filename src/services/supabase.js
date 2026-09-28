import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kskcwaxvwcsxzijweoah.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtza2N3YXh2d2NzeHppandlb2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMTMyMDcsImV4cCI6MjEwMzg4OTIwN30.jshtsoSp0CizXN9hUdhzhVKrf3YpfG-vgBSAnLqAVaw';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
// Automatically sanitize URL: strip trailing slash and remove /rest/v1 if accidentally included
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

