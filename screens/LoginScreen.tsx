import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import type { NavigationProps } from '../types/navigation'

export const LoginScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const signIn = useAuthStore((state) => state.signIn)

  const handleLogin = async () => {
    try {
      setLoading(true)
      await signIn(email, password)
    } catch (error: any) {
      alert(error?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
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
}) 