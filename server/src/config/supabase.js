const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

let supabase = null;

if (env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  try {
    supabase = createClient(env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Database] Supabase client initialized successfully.');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('[Database] No Supabase credentials provided; running in resilient local storage mode.');
}

module.exports = supabase;
