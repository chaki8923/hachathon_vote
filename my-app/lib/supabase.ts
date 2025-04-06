import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL or anon key is missing');
    }
    
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
};

export const supabase = typeof window !== 'undefined' 
  ? getSupabase() 
  : null as unknown as ReturnType<typeof createClient<Database>>;
