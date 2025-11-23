// Test S3 Service - Debug helper
// S3 functionality disabled
import { supabase } from './supabase'

export async function testS3Connection() {
  console.log('S3 Connection testing is currently disabled.')
  return { success: true, message: 'S3 disabled' }
}

// Make it available globally for testing
window.testS3Connection = testS3Connection
