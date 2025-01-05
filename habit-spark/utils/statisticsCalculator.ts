export interface HabitStatistics {
  completionRate: number  // Percentage of days with completed habits
  totalCompletions: number
  thisWeekCompletions: number
  thisMonthCompletions: number
  dailyCompletions: { date: string; percentage: number }[]
}

export const calculateStatistics = (completedDates: string[], totalHabits: number) => {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  // Get last year of dates
  const oneYearAgo = new Date(now)
  oneYearAgo.setFullYear(now.getFullYear() - 1)
  
  const lastYear = []
  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    lastYear.push(d.toISOString().split('T')[0])
  }

  // Normalize dates
  const normalizedDates = completedDates
    .map(date => new Date(date).toISOString().split('T')[0])
    .filter(date => date <= todayStr)

  // Calculate daily completion percentages
  const dailyCompletions = lastYear.map(date => {
    const completionsForDay = normalizedDates.filter(d => d === date).length
    return {
      date,
      percentage: (completionsForDay / totalHabits) * 100
    }
  })

  // Calculate last 7 days completion rate
  const last7Days = dailyCompletions.slice(-7)
  const last7DaysCompletions = last7Days.reduce((sum, day) => sum + day.percentage, 0) / 7

  // Calculate this week's completions
  const thisWeekCompletions = normalizedDates.filter(date => {
    const d = new Date(date)
    const today = new Date(now)
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    return d >= weekStart && d <= now
  }).length

  return {
    totalCompletions: new Set(normalizedDates).size,
    thisWeekCompletions,
    completionRate: Math.round(last7DaysCompletions),
    dailyCompletions
  }
} 