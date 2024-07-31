import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ybmehediczcaqwstbpit.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlibWVoZWRpY3pjYXF3c3RicGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE4MzI1MTUsImV4cCI6MjAzNzQwODUxNX0.hA1FwbHrB-HXIkXGFkSJ_cdUBAy5Jpwz2H1KDhTFFdo';
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;