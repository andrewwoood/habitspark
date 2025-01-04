import { supabase, withAuth } from '../api/supabaseClient'
import type { Habit } from '../types/habit'

export class HabitService {
  static async create(habitData: Partial<Habit>) {
    return withAuth(async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('Debug - Auth User:', user)
      
      if (!user?.id) {
        throw new Error('No authenticated user found')
      }

      const newHabit = {
        name: habitData.name,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Debug - Creating habit:', newHabit)

      const { data, error } = await supabase
        .from('habits')
        .insert([newHabit])
        .select()
        .single()

      if (error) {
        console.error('Habit creation error:', error)
        throw error
      }

      return data
    })
  }

  static async list() {
    return withAuth(async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    })
  }

  static async update(id: string, updates: Partial<Habit>) {
    return withAuth(async () => {
      const { data, error } = await supabase
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    })
  }

  static async delete(id: string) {
    return withAuth(async () => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id)

      if (error) throw error
    })
  }

  static async toggleCompletion(id: string, date: string) {
    return withAuth(async () => {
      // First get the current habit
      const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('completed_dates')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Initialize completed_dates array if it doesn't exist
      const completedDates = habit.completed_dates || []
      
      // Toggle the date
      const updatedDates = completedDates.includes(date)
        ? completedDates.filter(d => d !== date)
        : [...completedDates, date]

      // Update the habit
      const { data, error } = await supabase
        .from('habits')
        .update({ 
          completed_dates: updatedDates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Toggle completion error:', error)
        throw error
      }

      return data
    })
  }
} 