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

  // Group dates by day
  const completionsByDay = dates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate daily completion percentages
  const dailyCompletions = Object.entries(completionsByDay).map(([date, completions]) => ({
    date,
    percentage: Math.min((completions / totalHabits) * 100, 100) // Cap at 100%
  }))

  // Calculate averages
  const totalPercentage = dailyCompletions.reduce((sum, day) => sum + day.percentage, 0)
  const daysWithData = dailyCompletions.length || 1 // Prevent division by zero

  return {
    dailyCompletions,
    weeklyAverage: Math.round(totalPercentage / daysWithData),
    monthlyAverage: Math.round(totalPercentage / daysWithData)
  }
} 