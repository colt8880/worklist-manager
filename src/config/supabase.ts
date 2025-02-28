import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.error('[Supabase] Missing configuration:', {
    hasUrl: !!process.env.REACT_APP_SUPABASE_URL,
    hasKey: !!process.env.REACT_APP_SUPABASE_ANON_KEY
  });
  throw new Error('Missing Supabase configuration');
}

console.log('Supabase URL exists:', !!process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'worklist-manager-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Test the connection
(async () => {
  try {
    await supabase.from('projects').select('*').limit(1);
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Connection test successful');
    }
  } catch (error) {
    console.error('[Supabase] Connection test failed:', error);
  }
})(); 