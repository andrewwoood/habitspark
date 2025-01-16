export interface HabitStatistics {
  dailyCompletions: Array<{
    date: string
    percentage: number
  }>
  weeklyAverage: number
  monthlyAverage: number
}

export const calculateStatistics = (dates: string[], totalHabits: number): HabitStatistics => {
  // Handle empty cases first
  if (totalHabits === 0) {
    return {
      dailyCompletions: [],
      weeklyAverage: 0,
      monthlyAverage: 0
    }
  }

  // Get the date range for last 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    return date.toISOString().split('T')[0]
  })

  // Group dates by day
  const completionsByDay = dates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate daily completion percentages for all days in range
  const dailyCompletions = last7Days.map(date => ({
    date,
    percentage: Math.min(((completionsByDay[date] || 0) / totalHabits) * 100, 100)
  }))

  // Calculate weekly average only from days that have habits
  const last7DaysCompletions = dailyCompletions.slice(0, 7)
  const totalPercentage = last7DaysCompletions.reduce((sum, day) => sum + day.percentage, 0)
  const daysWithData = last7DaysCompletions.length || 1

  // Calculate monthly average from all available data
  const monthlyTotal = dailyCompletions.reduce((sum, day) => sum + day.percentage, 0)
  const monthlyDays = dailyCompletions.length || 1

  return {
    dailyCompletions,
    weeklyAverage: Math.round(totalPercentage / daysWithData),
    monthlyAverage: Math.round(monthlyTotal / monthlyDays)
  }
} 