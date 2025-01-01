export interface Habit {
  id: string
  user_id: string
  name: string
  created_at: string
  completed_dates: string[]
}

export interface HabitStats {
  completionRate: number
  currentStreak: number
  longestStreak: number
  totalCompletions: number
} 