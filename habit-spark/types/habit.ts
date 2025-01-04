export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  frequency: string
  completed_dates: string[]
  created_at: string
  updated_at: string
}

export interface HabitStats {
  completionRate: number
  currentStreak: number
  longestStreak: number
  totalCompletions: number
} 