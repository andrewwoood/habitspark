import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '../config/oauth'
import { User, Session } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useHabitStore } from './habitStore'

const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
    }
  }
)

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  error: string | null
  setUser: (user: User) => void
  fetchAvatar: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateAvatar: (url: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  avatarUrl: null,
  error: null,
  setUser: (user) => set({ user }),
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Store session in AsyncStorage
      await AsyncStorage.setItem('supabase-auth', JSON.stringify(data.session))
      console.log('Stored session:', data.session)
      
      set({ user: data.user, session: data.session })
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
  fetchAvatar: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (user?.user_metadata?.avatar_url) {
        set({ avatarUrl: user.user_metadata.avatar_url })
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  updateAvatar: async (url: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: { 
          avatar_url: url,
          updated_at: new Date().toISOString()
        }
      })
      
      if (error) throw error
      set({ user, avatarUrl: url })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  logout: async () => {
    try {
      await supabase.auth.signOut()
      useHabitStore.getState().clearStore()
      set({ user: null, session: null })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  },
})) 