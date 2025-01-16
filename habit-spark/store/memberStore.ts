import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import type { Database } from '../types/database'
import { calculateStreak } from '../utils/streakCalculator'

type Habit = Database['public']['Tables']['habits']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface MemberState {
  memberHabits: Habit[]
  memberProfile: UserProfile | null
  currentStreak: number
  loading: boolean
  error: string | null
  fetchMemberHabits: (memberId: string) => Promise<void>
  fetchMemberStreak: (memberId: string) => Promise<void>
  fetchMemberProfile: (memberId: string) => Promise<void>
  reset: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  memberHabits: [],
  memberProfile: null,
  currentStreak: 0,
  loading: false,
  error: null,

  fetchMemberHabits: async (memberId: string) => {
    try {
      set({ loading: true, error: null })
      
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', memberId)
        .order('created_at', { ascending: true })

      if (error) throw error
      set({ memberHabits: habits || [] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchMemberProfile: async (memberId: string) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase
        .rpc('get_user_profiles', {
          user_ids: [memberId]
        })

      if (error) throw error
      set({ memberProfile: data?.[0] || null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchMemberStreak: async (memberId: string) => {
    try {
      set({ loading: true, error: null })
      
      const { data: habits, error } = await supabase
        .from('habits')
        .select('completed_dates')
        .eq('user_id', memberId)

      if (error) throw error

      // Calculate streak from all completed dates
      const allCompletedDates = habits?.reduce((dates, habit) => 
        [...dates, ...(habit.completed_dates || [])], [] as string[])
      
      // Get unique dates for streak calculation
      const uniqueDates = [...new Set(allCompletedDates)]
      
      // Calculate streak using the utility function
      const streak = calculateStreak(uniqueDates)
      set({ currentStreak: streak })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  reset: () => {
    set({
      memberHabits: [],
      memberProfile: null,
      currentStreak: 0,
      loading: false,
      error: null
    })
  }
})) 