import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import type { NavigationProps } from '../types/navigation'

export const SignUpScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const signUp = useAuthStore((state) => state.signUp)

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) return
    try {
      setLoading(true)
      await signUp(email.trim(), password.trim())
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Create Account</Text>
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
        onPress={handleSignUp}
        loading={loading}
        style={styles.button}
      >
        Sign Up
      </Button>
      <Button 
        mode="text" 
        onPress={() => navigation.navigate('Login')}
      >
        Already have an account? Log In
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
}) 