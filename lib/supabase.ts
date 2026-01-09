import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kfhgpyajrjdtuqsdabye.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmaGdweWFqcmpkdHVxc2RhYnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzczMzIsImV4cCI6MjA4MzIxMzMzMn0.O-7s_VTQAx8vJP-G6OfpvArritmMM3x2veuTUIjJhvg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});