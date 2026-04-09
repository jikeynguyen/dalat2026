import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvensemhzsrlcruviirh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_G4jNkxea5S_nMYyTaz3P5g_zVcZ0x6T'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
