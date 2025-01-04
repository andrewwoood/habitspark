import { create } from 'zustand'
import { HabitService } from '../services/habitService'
import type { Habit } from '../types/habit'

interface HabitsState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    try {
      set({ loading: true })
      const habits = await HabitService.list()
      set({ habits, error: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  addHabit: async (habit: Partial<Habit>) => {
    try {
      set({ loading: true })
      const newHabit = await HabitService.create(habit)
      set(state => ({ 
        habits: [newHabit, ...state.habits],
        error: null 
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  updateHabit: async (id: string, habit: Partial<Habit>) => {
    try {
      set({ loading: true })
      const updatedHabit = await HabitService.update(id, habit)
      set(state => ({
        habits: state.habits.map(h => h.id === id ? updatedHabit : h),
        error: null
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  deleteHabit: async (id: string) => {
    try {
      set({ loading: true })
      await HabitService.delete(id)
      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        error: null
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  toggleHabit: async (id: string, date: string) => {
    try {
      set({ loading: true })
      const updatedHabit = await HabitService.toggleCompletion(id, date)
      set(state => ({
        habits: state.habits.map(h => 
          h.id === id ? updatedHabit : h
        ),
        error: null
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
})) 