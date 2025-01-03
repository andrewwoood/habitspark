import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'

const supabaseUrl = SUPABASE_URL
const supabaseAnonKey = SUPABASE_ANON_KEY

const supabaseConfig = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  global: {
    fetch: fetch.bind(globalThis)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)

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