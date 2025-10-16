import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Environment Variable Definitions ---
// Based on the README, we expect VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY.

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for required variables and provide helpful errors if they are missing.
if (!SUPABASE_PROJECT_ID) {
  throw new Error("Missing VITE_SUPABASE_PROJECT_ID environment variable.");
}
if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable.");
}

// Construct the full Supabase URL from the project ID
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

/**
 * The public project ID, which is used in App.tsx for some logic
 */
export const projectId: string = SUPABASE_PROJECT_ID;

/**
 * Initializes and returns the Supabase client instance.
 * @returns {SupabaseClient} The Supabase client.
 */
export function getSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Note: This file replaces the need for separate 'supabase-client.ts' and 'supabase/info.ts'.
// You should update your imports in App.tsx to reflect this new structure.
