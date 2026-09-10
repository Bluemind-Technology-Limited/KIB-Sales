import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rdpfgxlshjxfwzwieker.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGZneGxzaGp4Znd6d2lla2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMDU0MTcsImV4cCI6MjEwMjY4MTQxN30.6bRP3wCSjtGwiEZIFC6DXuiPquxIlHsS4BiZ02lPjzs';

/** Shared Supabase client used for Auth (JWTs) and Realtime subscriptions. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
