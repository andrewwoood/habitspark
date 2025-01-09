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
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ habits })
    } catch (error: any) {
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
        : [...completedDates, date]

      const { error } = await supabase
        .from('habits')
        .update({ completed_dates: newCompletedDates })
        .eq('id', habitId)

      if (error) throw error
      set(state => ({
        habits: state.habits.map(h =>
          h.id === habitId ? { ...h, completed_dates: newCompletedDates } : h
        ),
      }))

      const prevAchievements = getUnlockedAchievements(get().previousStreak)
      const newAchievements = getUnlockedAchievements(get().currentStreak)
      
      if (newAchievements.length > prevAchievements.length) {
        const latestAchievement = newAchievements[newAchievements.length - 1]
        const toastConfig = {
          type: 'success',
          props: {
            achievement: latestAchievement
          },
          position: 'top',
          visibilityTime: 4000,
          autoHide: true,
          customComponent: () => React.createElement(AchievementToast, { 
            achievement: latestAchievement 
          })
        }
        Toast.show(toastConfig)
      }
      
      set({ previousStreak: get().currentStreak })
    } catch (error: any) {
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
})) 