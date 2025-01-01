import * as React from 'react'
import { supabase } from '../api/supabaseClient'
import { useAuthStore } from '../store/authStore'
import { View, ActivityIndicator } from 'react-native'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((state) => state.setUser)
  const loading = useAuthStore((state) => state.loading)

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.setState({ session, user: session?.user ?? null, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({ session, user: session?.user ?? null })
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <>{children}</>
} 