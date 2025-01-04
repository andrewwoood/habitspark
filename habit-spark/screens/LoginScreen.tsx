import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { NavigationProps } from '../types/navigation'
import * as Google from 'expo-auth-session/providers/google'
import { googleOAuthConfig } from '../config/oauth'
import { supabase } from '../api/supabaseClient'
import { checkAuth } from '../api/supabaseClient'

export const LoginScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithToken } = useAuthStore()
  
  const [request, response, promptAsync] = Google.useAuthRequest(googleOAuthConfig)

  const handleLogin = async () => {
    try {
      setLoading(true)
      await signIn(email, password)
      
      // Verify auth state
      const authState = await checkAuth()
      console.log('Auth State after login:', authState)
      
    } catch (error) {
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

  const fetchHabits = async () => {
    const { data: session } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('No session found')
      return
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching habits:', error)
      return
    }

    return data
  }

  const addHabit = async (habitData) => {
    const { data: session } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('No session found')
      return
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          ...habitData,
          user_id: session.user.id
        }
      ])

    if (error) {
      console.error('Error adding habit:', error)
      return
    }

    return data
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Habit Spark</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button 
        mode="contained" 
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Login
      </Button>
      <Button 
        mode="outlined"
        onPress={handleGoogleSignIn}
        disabled={!request || loading}
        style={styles.googleButton}
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="google" size={size} color={color} />
        )}
      >
        Sign in with Google
      </Button>
      <Button 
        mode="text" 
        onPress={() => navigation.navigate('SignUp')}
      >
        Don't have an account? Sign Up
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 16,
  },
  googleButton: {
    marginVertical: 8,
    borderColor: '#4285F4',
  },
}) 