import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import type { Database } from '../types/database'
import { useGroupStore } from './groupStore'

type Habit = Database['public']['Tables']['habits']['Row']

interface HabitState {
  habits: Habit[]
  loading: boolean
  error: string | null
  clearStore: () => void
  fetchHabits: () => Promise<void>
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_dates'>) => Promise<void>
  toggleHabit: (habitId: string, date: string) => Promise<void>
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>
  currentStreak: number;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,
  
  clearStore: () => {
    console.log('Clearing habit store')
    set({ habits: [], loading: false, error: null })
    console.log('Store after clear:', get().habits)
  },
  
  fetchHabits: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Fetching habits for user:', user?.id)
    if (!user) {
      console.log('No user found, returning')
      return
    }

    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      console.log('Fetched habits:', data)
      console.log('For user:', user.id)

      if (error) throw error
      set({ habits: data || [] })
    } catch (error) {
      console.error('Error fetching habits:', error)
      set({ error: 'Failed to fetch habits' })
    } finally {
      set({ loading: false })
    }
  },

  addHabit: async (habit) => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Adding habit for user:', user?.id)
    if (!user) {
      console.log('No user found, cannot add habit')
      return
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([
          {
            ...habit,
            user_id: user.id,
            completed_dates: [],
          }
        ])
        .select()

      if (error) throw error
      console.log('Added habit:', data)
      
      // Refresh habits list
      await get().fetchHabits()
    } catch (error) {
      console.error('Error adding habit:', error)
      throw error
    }
  },

  toggleHabit: async (habitId: string, date: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const habit = get().habits.find(h => h.id === habitId)
      if (!habit) return

      const completed_dates = [...(habit.completed_dates || [])]
      const dateIndex = completed_dates.indexOf(date)

      if (dateIndex === -1) {
        completed_dates.push(date)
      } else {
        completed_dates.splice(dateIndex, 1)
      }

      const { error } = await supabase
        .from('habits')
        .update({ completed_dates })
        .eq('id', habitId)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Update local state
      const updatedHabits = get().habits.map(h => 
        h.id === habitId ? { ...h, completed_dates } : h
      )
      set({ habits: updatedHabits })

      // Update group stats for all groups user is member of
      const groups = useGroupStore.getState().groups
      for (const group of groups) {
        await useGroupStore.getState().updateGroupStats(
          group.id,
          date
        )
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
      throw error
    }
  },

  toggleHabitCompletion: async (habitId: string, date: string) => {
    try {
      // ... existing habit toggle logic

      // Update group stats for all groups user is member of
      const groups = useGroupStore.getState().groups
      for (const group of groups) {
        await useGroupStore.getState().updateGroupStats(
          group.id,
          date
        )
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
  }
})) 