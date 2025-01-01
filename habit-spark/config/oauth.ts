import { makeRedirectUri, ResponseType } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession()

const useProxy = Platform.select({ web: false, default: true })

// OAuth configuration
export const googleOAuthConfig = {
  clientId: Platform.select({
    ios: process.env.EXPO_CLIENT_ID,
    android: process.env.EXPO_CLIENT_ID,
    default: process.env.GOOGLE_CLIENT_ID,
  }),
  redirectUri: makeRedirectUri({
    scheme: 'habit-spark',
    path: 'google-auth',
    useProxy,
  }),
  scopes: ['profile', 'email'],
  responseType: ResponseType.Token,
  usePKCE: true,
  useProxy,
} 