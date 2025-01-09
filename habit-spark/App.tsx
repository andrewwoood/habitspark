import { useEffect } from 'react'
import { supabase } from './api/supabaseClient'
import { useAuthStore } from './store/authStore'
import { Linking } from 'react-native'
import { useGroupStore } from './store/groupStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeProvider } from './theme/ThemeContext'
import { NavigationContainer } from '@react-navigation/native'
import { Navigation } from './navigation/Navigation'

export default function App() {
  const setUser = useAuthStore(state => state.setUser)
  
  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </ThemeProvider>
  )
} 

// In your navigation setup
const linking = {
  prefixes: ['habitspark://'],
  config: {
    screens: {
      SignUp: 'signup',
      Groups: 'groups',
      GroupDetails: 'group/:id',
      Invite: 'invite/:groupId'
    }
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL()
    return url
  },
  subscribe(listener: (url: string) => void) {
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url)
    })
    return () => {
      linkingSubscription.remove()
    }
  },
}

// Handle the invite flow
const handleInviteLink = async (groupId: string) => {
  const { user } = useAuthStore.getState()
  if (!user) {
    // Save the group ID to join after signup
    await AsyncStorage.setItem('pendingInvite', groupId)
    navigation.navigate('SignUp')
    return
  }

  try {
    await useGroupStore.getState().joinGroupByInvite(groupId)
    navigation.navigate('GroupDetails', { groupId })
  } catch (error) {
    console.error('Error handling invite:', error)
  }
} 