import * as React from 'react'
import { useState, useEffect } from 'react'
import { View, StyleSheet, AsyncStorage, SafeAreaView } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { NavigationProps } from '../types/navigation'
import { useGroupStore } from '../store/groupStore'
import { useAppTheme } from '../theme/ThemeContext'
import { supabase } from '../api/supabaseClient'

export const SignUpScreen = ({ navigation }: NavigationProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const signUp = useAuthStore((state) => state.signUp)
  const user = useAuthStore((state) => state.user)
  const { theme } = useAppTheme()

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await signUp(email.trim(), password.trim())
    } catch (error: any) {
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
      })
      if (error) throw error
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handlePendingInvite = async () => {
      const pendingInvite = await AsyncStorage.getItem('pendingInvite')
      if (pendingInvite) {
        await AsyncStorage.removeItem('pendingInvite')
        await useGroupStore.getState().joinGroupByInvite(pendingInvite)
        navigation.navigate('GroupDetails', { groupId: pendingInvite })
      }
    }

    if (user) {
      handlePendingInvite()
    }
  }, [user])

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
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
            Join HabitSpark
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            Start your journey to better habits today
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
          <View style={styles.formSection}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              outlineColor={theme.primary}
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
              theme={{
                colors: {
                  background: theme.surface,
                  onSurfaceVariant: '#666666',
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
              outlineColor={theme.primary}
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
              theme={{
                colors: {
                  background: theme.surface,
                  onSurfaceVariant: '#666666',
                },
              }}
            />
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              outlineColor={theme.primary}
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
              theme={{
                colors: {
                  background: theme.surface,
                  onSurfaceVariant: '#666666',
                },
              }}
            />
            <Button 
              mode="contained" 
              onPress={handleSignUp}
              loading={loading}
              style={styles.signUpButton}
              buttonColor={theme.primary}
              textColor="white"
              labelStyle={styles.buttonLabel}
            >
              Sign Up
            </Button>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.primary }]} />
              <Text style={[styles.dividerText, { color: theme.text.secondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.primary }]} />
            </View>

            <Button 
              mode="outlined"
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleButton}
              textColor="#757575"
              labelStyle={styles.buttonLabel}
              icon={({ size }) => (
                <View style={styles.googleIconContainer}>
                  <MaterialCommunityIcons 
                    name="google" 
                    size={size} 
                    color={theme.primary}
                    style={styles.googleIcon}
                  />
                </View>
              )}
            >
              Sign up with Google
            </Button>

            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              textColor={theme.primary}
              labelStyle={styles.linkLabel}
            >
              Already have an account? Login
            </Button>
          </View>
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
  formCard: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formSection: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    height: 56,
  },
  signUpButton: {
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
    opacity: 0.5,
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
    borderColor: '#dadce0',
    backgroundColor: 'white',
  },
  googleIconContainer: {
    marginRight: 8,
  },
  googleIcon: {
    marginRight: 8,
  },
  loginButton: {
    marginTop: 'auto',
  },
}) 