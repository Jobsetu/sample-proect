import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qcbxdkgbcqxedkyyanby.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYnhka2diY3F4ZWRreXlhbmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDc1NjUsImV4cCI6MjA2ODcyMzU2NX0.1bsme1Bc0_bBssffWd18Vv-1hbIQaxkxKnZPKpbks6E'

// Create a single instance to avoid multiple GoTrueClient instances
let supabaseInstance = null

if (!supabaseInstance) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    storage: {
      // Use the direct storage hostname for optimal performance
      // This provides several performance enhancements for uploading large files
      url: 'https://qcbxdkgbcqxedkyyanby.storage.supabase.co'
    },
    // Add S3-compatible configuration for better storage handling
    global: {
      headers: {
        'x-client-info': 'supabase-js-web'
      }
    }
  })
}

export const supabase = supabaseInstance
