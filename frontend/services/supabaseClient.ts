import { createClient } from '@supabase/supabase-js';

// Supabase client configured with your project details.
const supabaseUrl = 'https://oxrhwvnxycfjbkgjftnp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cmh3dm54eWNmamJrZ2pmdG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzE0MjYsImV4cCI6MjA3MzAwNzQyNn0.Sq3Y83vOUjMkXwN0SJYiEkYNP9PJAIUiSkEoRDXDsG0';

if (!supabaseUrl || supabaseUrl.includes('placeholder.supabase.co') || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
    console.error("Supabase URL is not correctly configured. Please check it in frontend/services/supabaseClient.ts");
}
if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder_key') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    console.error("Supabase Anon Key is not correctly configured. Please check it in frontend/services/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);