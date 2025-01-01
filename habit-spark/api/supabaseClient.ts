import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  }
})

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