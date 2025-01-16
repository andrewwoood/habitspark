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
  currentStreak: number
  createHabit: (name: string) => Promise<void>
  fetchHabits: () => Promise<void>
  toggleHabit: (habitId: string, date: string) => Promise<void>
  updateStreak: () => Promise<void>
  calculateCurrentStreak: () => number
  addHabit: (habit: { name: string, description: string, frequency: string }) => Promise<void>
  updateHabit: (habitId: string, updates: { name: string }) => Promise<void>
  deleteHabit: (habitId: string) => Promise<void>
  fetchUserHabits: (userId: string) => Promise<Habit[]>
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,
  error: null,
  currentStreak: 0,
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

      const { data, error } = await supabase
        .from('habits')
        .update({ completed_dates: newCompletedDates })
        .eq('id', habitId)
        .select()

      if (error) throw error

      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId ? { ...h, completed_dates: newCompletedDates } : h
        ),
      }))

      // Update streak after habit is toggled
      await get().updateStreak()
    } catch (error: any) {
      console.error('Error in toggleHabit:', error)
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  updateStreak: async () => {
    try {
      const newStreak = get().calculateCurrentStreak()
      set({ currentStreak: newStreak })
    } catch (error: any) {
      console.error('Error updating streak:', error)
      set({ error: error.message })
    }
  },
  calculateCurrentStreak: () => {
    const habits = get().habits
    if (!habits.length) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let currentDate = new Date(today)
    let streak = 0

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const allCompleted = habits.every(habit => 
        habit.completed_dates?.includes(dateStr)
      )

      if (!allCompleted) break
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }

    return streak
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