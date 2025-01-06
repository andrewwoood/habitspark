import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import { supabaseConfig } from '../config/oauth'

export const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web'
    },
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
)

// Debug helper
export const checkAuth = async () => {
  const session = await supabase.auth.getSession()
  console.log('Current Session:', session)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('Current User:', user)
  console.log('Auth Error:', error)
  
  return { session, user, error }
}

// Add helper to verify auth state
export const verifyAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    throw new Error('Not authenticated')
  }
  return session
}

// Use this wrapper for authenticated requests
export const withAuth = async (operation: () => Promise<any>) => {
  await verifyAuth()
  return operation()
}

// Add storage helper functions
export const uploadAvatar = async (filePath: string, file: Blob) => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)
    if (error) throw error
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

export const getAvatarUrl = (filePath: string) => {
  try {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error('Error getting avatar URL:', error)
    return null
  }
} 