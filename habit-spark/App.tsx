import { useEffect } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuthStore } from './store/authStore'

function App() {
  const setUser = useAuthStore(state => state.setUser)
  
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user)
      if (session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  // ... rest of your App component
} 