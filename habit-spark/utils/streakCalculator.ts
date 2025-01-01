export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates?.length) return 0
  
  // Sort dates in descending order
  const sortedDates = [...completedDates].sort((a, b) => b.localeCompare(a))
  
  let currentStreak = 1
  const today = new Date().toISOString().split('T')[0]
  let lastDate = new Date(sortedDates[0])
  
  // If the last completion wasn't today or yesterday, streak is broken
  if (sortedDates[0] !== today && 
      sortedDates[0] !== new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
    return 0
  }

  // Calculate streak by checking consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / 86400000)
    
    if (dayDiff === 1) {
      currentStreak++
      lastDate = currentDate
    } else {
      break
    }
  }

  return currentStreak
}

export const calculateLongestStreak = (completedDates: string[]): number => {
  if (!completedDates?.length) return 0
  
  const sortedDates = [...completedDates].sort()
  let longestStreak = 1
  let currentStreak = 1
  let lastDate = new Date(sortedDates[0])

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const dayDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / 86400000)
    
    if (dayDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (dayDiff > 1) {
      currentStreak = 1
    }
    
    lastDate = currentDate
  }

  return longestStreak
} 