import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import Toast from 'react-native-toast-message'
import React from 'react'
import { getUnlockedAchievements } from '../utils/achievements'
import { AchievementToast } from '../components/AchievementToast'
import type { ReactNode } from 'react'

export interface Habit {
  id: string
  user_id: string
  name: string
  created_at: string
  completed_dates: string[]
}

interface HabitState {
  habits: Habit[]
  loading: boolean
  error: string | null
  bestStreak: number
  currentStreak: number
  previousStreak: number
  createHabit: (name: string) => Promise<void>
  fetchHabits: () => Promise<void>
  toggleHabit: (habitId: string, date: string) => Promise<void>
  updateBestStreak: (streak: number) => Promise<void>
  addHabit: (habit: { name: string, description: string, frequency: string }) => Promise<void>
  updateHabit: (habitId: string, updates: { name: string }) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  fetchUserHabits: (userId: string) => Promise<Habit[]>
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,
  bestStreak: 0,
  currentStreak: 0,
  previousStreak: 0,
  createHabit: async (name: string) => {
    try {
      set({ loading: true, error: null })
      const { data: habit, error } = await supabase
        .from('habits')
        .insert([{ name, user_id: supabase.auth.getUser()?.id }])
        .select()
        .single()

      if (error) throw error
      set(state => ({ habits: [...state.habits, habit] }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  fetchHabits: async () => {
    try {
      set({ loading: true, error: null })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      console.log('Fetching habits for user:', user.id)
      
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('Fetched habits:', habits)
      
      set({ habits: habits || [] })
    } catch (error: any) {
      console.error('Error in fetchHabits:', error)
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  toggleHabit: async (habitId: string, date: string) => {
    try {
      set({ loading: true, error: null })
      const habit = get().habits.find(h => h.id === habitId)
      if (!habit) throw new Error('Habit not found')

      const completedDates = habit.completed_dates || []
      const newCompletedDates = completedDates.includes(date)
        ? completedDates.filter(d => d !== date)
        : [...completedDates, date].sort()

      console.log('Updating habit:', habitId)
      console.log('Previous completed dates:', completedDates)
      console.log('New completed dates:', newCompletedDates)

      const { data, error } = await supabase
        .from('habits')
        .update({ completed_dates: newCompletedDates })
        .eq('id', habitId)
        .select()

      if (error) throw error
      
      console.log('Supabase update response:', data)

      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId ? { ...h, completed_dates: newCompletedDates } : h
        ),
      }))
    } catch (error: any) {
      console.error('Error in toggleHabit:', error)
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  updateBestStreak: async (streak: number) => {
    try {
      if (streak <= get().bestStreak) return
      
      const { error } = await supabase
        .from('user_stats')
        .upsert({ 
          user_id: (await supabase.auth.getUser()).data.user?.id,
          best_streak: streak 
        })

      if (error) throw error
      set({ bestStreak: streak })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  addHabit: async (habit) => {
    try {
      set({ loading: true, error: null })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      
      // Refresh habits list
      await get().fetchHabits()
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  updateHabit: async (habitId: string, updates: { name: string }) => {
    try {
      set({ loading: true, error: null })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Update local state
      set(state => ({
        habits: state.habits.map(h => 
          h.id === habitId ? { ...h, ...updates } : h
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  deleteHabit: async (habitId: string) => {
    try {
      set({ loading: true, error: null })
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Update local state
      set(state => ({
        habits: state.habits.filter(h => h.id !== habitId)
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  fetchUserHabits: async (userId: string) => {
    try {
      console.log('fetchUserHabits called with userId:', userId)
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      console.log('Fetched habits response:', { habits, error })

      if (error) throw error
      return habits || []
    } catch (error) {
      console.error('Error fetching user habits:', error)
      throw error
    }
  }
})) 