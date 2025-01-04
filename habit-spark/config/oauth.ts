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