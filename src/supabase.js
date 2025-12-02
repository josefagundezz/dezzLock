// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jlvwweehaqujzcscscwj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsdnd3ZWVoYXF1anpjc2NzY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NDg0OTksImV4cCI6MjA4MDIyNDQ5OX0.HY9ysY8gz1oDXObgVTxun38hplys7HvJymI1h_9_eqA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)