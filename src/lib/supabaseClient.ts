import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iskqocnpwrqnagthprpq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3FvY25wd3JxbmFndGhwcnBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDYwNzUsImV4cCI6MjA3ODA4MjA3NX0.b2cQMgTwRQoyqWdl-oHnoIhwv8Mtr6s4ha6sumTo6cc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
    headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json',  // ← Ключевой заголовок против 406
    },
    },
})