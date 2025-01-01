export interface HabitStatistics {
  completionRate: number  // Percentage of days with completed habits
  totalCompletions: number
  thisWeekCompletions: number
  thisMonthCompletions: number
}

export const calculateStatistics = (completedDates: string[]): HabitStatistics => {
  const today = new Date()
  const uniqueDates = [...new Set(completedDates)]
  
  // Calculate dates for week and month
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)
  const monthStart = new Date(today)
  monthStart.setDate(today.getDate() - 30)
  
  const thisWeekCompletions = uniqueDates.filter(date => 
    new Date(date) >= weekStart).length
  
  const thisMonthCompletions = uniqueDates.filter(date => 
    new Date(date) >= monthStart).length
  
  // Calculate completion rate for the last 30 days
  const completionRate = (thisMonthCompletions / 30) * 100

  return {
    completionRate,
    totalCompletions: uniqueDates.length,
    thisWeekCompletions,
    thisMonthCompletions,
  }
} 