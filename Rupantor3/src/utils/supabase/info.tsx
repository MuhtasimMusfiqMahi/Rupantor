/* Supabase public client config. Values can come from Vite env or fallback to defaults. */

// Read from Vite env vars when available (Vercel/Netlify recommended):
// VITE_SUPABASE_PROJECT_ID, VITE_SUPABASE_ANON_KEY
const envProjectId = import.meta?.env?.VITE_SUPABASE_PROJECT_ID as string | undefined;
const envAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// Fallbacks keep current local dev working if envs aren’t set
const fallbackProjectId = "ewrakprpvsktasyfadnx";
const fallbackAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cmFrcHJwdnNrdGFzeWZhZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNjc0NzIsImV4cCI6MjA3NTg0MzQ3Mn0.iJk23kDj-YlEoy8CLRiFAAGjl2SJ1tm1RcNl5SQoyKg";

export const projectId = (envProjectId && envProjectId.trim()) ? envProjectId : fallbackProjectId;
export const publicAnonKey = (envAnonKey && envAnonKey.trim()) ? envAnonKey : fallbackAnonKey;