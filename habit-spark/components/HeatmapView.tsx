import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import type { HabitStatistics } from '../utils/statisticsCalculator'
import type { Theme } from '../theme/colors'

interface HeatmapViewProps {
  dailyCompletions: HabitStatistics['dailyCompletions']
  timeframe: '1m' | '3m' | '6m'
  theme: Theme
  isDark: boolean
}

export const HeatmapView = ({ dailyCompletions, timeframe, theme, isDark }: HeatmapViewProps) => {
  const getDates = () => {
    const weeks = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = []
    
    const now = new Date()
    const startDate = new Date()
    
    // Calculate start date based on timeframe
    switch (timeframe) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
    }
    
    startDate.setDate(1) // Start from first day of month
    const dates = []
    
    // Add all dates from start date to now
    const currentDate = new Date(startDate)
    while (currentDate <= now) {
      dates.push(currentDate.toISOString().split('T')[0])
      
      if (currentDate.getDate() === 1) {
        months.push({
          name: currentDate.toLocaleString('default', { month: 'short' }),
          index: dates.length - 1
        })
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Group into weeks
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7))
    }
    
    return { weeks, days, months }
  }

  const getColorForPercentage = (date: string | null) => {
    if (!date) return 'transparent'
    if (new Date(date) > new Date()) return theme.surface // Future dates
    
    const completion = dailyCompletions.find(d => d.date === date)
    if (!completion || completion.percentage === 0) {
      return isDark ? '#2D2D2D' : '#F5F5F5' // Light gray in light mode, darker gray in dark mode
    }
    
    // Theme-aware colors (light to dark)
    if (completion.percentage <= 25) return theme.primary + '40'
    if (completion.percentage <= 50) return theme.primary + '80'
    if (completion.percentage <= 75) return theme.primary + 'BF'
    return theme.primary
  }

  const { weeks, days, months } = getDates()

  return (
    <View style={styles.container}>
      <View style={styles.dayLabels}>
        {days.map((day, index) => (
          <Text 
            key={index} 
            style={[styles.dayLabel, { color: theme.text.secondary }]}
          >
            {day}
          </Text>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((date, dateIndex) => (
                <View
                  key={`${weekIndex}-${dateIndex}`}
                  style={[
                    styles.day,
                    { backgroundColor: getColorForPercentage(date) }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#8B4513',
    height: 15,
    width: 30,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  week: {
    flexDirection: 'column',
    gap: 4,
  },
  day: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
}) 