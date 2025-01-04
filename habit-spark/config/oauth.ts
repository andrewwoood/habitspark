import { makeRedirectUri, ResponseType, Prompt } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession()

// OAuth configuration
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  iosClientId: process.env.EXPO_CLIENT_ID,
  androidClientId: process.env.EXPO_CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  responseType: ResponseType.Token,
  prompt: Prompt.SelectAccount,
  useProxy: false
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseConfig = {
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY as string,
} 