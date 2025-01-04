import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import { User, Session } from '@supabase/supabase-js'
import { Platform } from 'react-native'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  error: string | null
  fetchAvatar: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateAvatar: (url: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  avatarUrl: null,
  error: null,
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
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
})) 