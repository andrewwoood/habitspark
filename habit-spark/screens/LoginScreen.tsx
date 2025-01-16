import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { NavigationProps } from '../types/navigation'
import * as Google from 'expo-auth-session/providers/google'
import { googleOAuthConfig } from '../config/oauth'
import { supabase } from '../api/supabaseClient'
import { checkAuth } from '../api/supabaseClient'
import { useAppTheme } from '../theme/ThemeContext'

export const LoginScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithToken } = useAuthStore()
  const { theme } = useAppTheme()
  
  const [request, response, promptAsync] = Google.useAuthRequest(googleOAuthConfig)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    
    try {
      setLoading(true)
      await signIn(email.trim(), password.trim())
      
      // Verify auth state
      const authState = await checkAuth()
      console.log('Auth State after login:', authState)
      
    } catch (error: any) {
      console.error('Login error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: false
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Logo and Title Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons 
              name="fire" 
              size={48} 
              color={theme.accent} 
            />
            <MaterialCommunityIcons 
              name="star-four-points" 
              size={16} 
              color={theme.accent}
              style={styles.sparkle} 
            />
          </View>
          <Text 
            variant="headlineMedium" 
            style={[styles.title, { color: theme.text.primary }]}
          >
            Welcome to HabitSpark
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            Track your habits, achieve your goals, and spark positive change
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor={theme.primary}
            textColor={theme.text.primary}
            placeholderTextColor={theme.text.secondary}
            theme={{
              colors: {
                background: 'white',
                onSurfaceVariant: theme.text.secondary,
              },
            }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            outlineColor="transparent"
            activeOutlineColor={theme.primary}
            textColor={theme.text.primary}
            placeholderTextColor={theme.text.secondary}
            theme={{
              colors: {
                background: 'white',
                onSurfaceVariant: theme.text.secondary,
              },
            }}
          />
          <Button 
            mode="contained" 
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            buttonColor="#F4A460"
            textColor="white"
            labelStyle={styles.buttonLabel}
          >
            Login
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.text.disabled }]} />
            <Text style={[styles.dividerText, { color: theme.text.secondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.text.disabled }]} />
          </View>

          <Button 
            mode="outlined"
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
            style={[styles.googleButton, { borderColor: theme.text.disabled }]}
            textColor={theme.text.primary}
            labelStyle={styles.buttonLabel}
            icon={({ size }) => (
              <MaterialCommunityIcons 
                name="google" 
                size={size} 
                color={theme.text.primary} 
                style={styles.googleIcon}
              />
            )}
          >
            Sign in with Google
          </Button>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('SignUp')}
            style={styles.signUpButton}
            textColor={theme.primary}
            labelStyle={styles.linkLabel}
          >
            Don't have an account? Sign Up
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkle: {
    position: 'absolute',
    right: -8,
    top: -4,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
  },
  formSection: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 56,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 8,
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: 24,
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  googleIcon: {
    marginRight: 8,
  },
  footerSection: {
    alignItems: 'center',
  },
  signUpButton: {
    marginTop: 'auto',
  },
}) 