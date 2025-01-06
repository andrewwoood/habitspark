import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import { supabaseConfig } from '../config/oauth'
import { User, Session } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useHabitStore } from './habitStore'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  error: string | null
  displayName: string | null
  setUser: (user: User) => void
  fetchAvatar: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateAvatar: (url: string) => Promise<void>
  logout: () => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  updateProfile: (profile: { displayName?: string; avatarUrl?: string }) => Promise<void>
  syncUserProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  avatarUrl: null,
  error: null,
  displayName: null,
  setUser: (user) => {
    console.log('Setting user with metadata:', user?.user_metadata)
    set({ 
      user,
      displayName: user?.user_metadata?.name || user?.user_metadata?.display_name || null,
      avatarUrl: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
    })
  },
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      console.log('User metadata:', data.user?.user_metadata)
      
      set({ 
        user: data.user, 
        session: data.session,
        displayName: data.user?.user_metadata?.display_name || null,
        avatarUrl: data.user?.user_metadata?.avatar_url || data.user?.user_metadata?.picture || null
      })
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
  updateDisplayName: async (name: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: { 
          display_name: name,
          updated_at: new Date().toISOString()
        }
      })
      
      if (error) throw error
      set({ user, displayName: name })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  updateProfile: async (profile) => {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: { 
          display_name: profile.displayName,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        }
      })
      
      if (error) throw error
      set({ 
        user,
        displayName: profile.displayName || null,
        avatarUrl: profile.avatarUrl || null
      })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  syncUserProfile: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (!user) return

      const { data, error: profileError } = await supabase
        .rpc('get_user_profiles', {
          user_ids: [user.id]
        })

      if (profileError) throw profileError
      if (data && data[0]) {
        set({ 
          displayName: data[0].display_name || user.user_metadata?.name,
          avatarUrl: data[0].avatar_url || user.user_metadata?.picture
        })
      }
    } catch (error) {
      console.error('Error syncing profile:', error)
    }
  },
})) 