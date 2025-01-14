import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'

interface GroupHeatmapProps {
  completionData: Array<{
    date: string
    completion_rate: number
    member_count: number
  }>
  timeframe: string
}

export const GroupHeatmap = ({ completionData }: GroupHeatmapProps) => {
  const { theme, isDark } = useAppTheme()

  const getDates = () => {
    const weeks = []
    const days = ['', 'Mon', '', 'Wed', '', 'Fri', '']
    const months = []
    
    // Get current year dates
    const now = new Date()
    const year = now.getFullYear()
    const startDate = new Date(year, 0, 1)
    
    // Add padding for start of year
    const dates = Array(startDate.getDay()).fill(null)
    
    // Add all dates for the year
    const currentDate = new Date(startDate)
    while (currentDate.getFullYear() === year) {
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
    
    return { weeks, days, months, year }
  }

  const getColorForPercentage = (date: string | null) => {
    if (!date) return 'transparent'
    if (new Date(date) > new Date()) return theme.background
    
    const dayData = completionData.find(d => d.date === date)
    if (!dayData || dayData.completion_rate === 0) {
      return isDark ? theme.surface : '#F5F5F5'
    }
    
    // Use amber theme colors
    if (dayData.completion_rate <= 25) return `${theme.primary}40` // 25% opacity
    if (dayData.completion_rate <= 50) return `${theme.primary}80` // 50% opacity
    if (dayData.completion_rate <= 75) return `${theme.primary}BF` // 75% opacity
    return theme.primary
  }

  const { weeks, days, months, year } = getDates()

  const styles = StyleSheet.create({
    outerContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      elevation: 4,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: 4,
      marginVertical: 8,
    },
    headerContainer: {
      marginBottom: 12,
    },
    yearLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 8,
    },
    monthLabels: {
      flexDirection: 'row',
      paddingLeft: 48,
    },
    monthLabel: {
      fontSize: 11,
      color: theme.text.secondary,
      fontWeight: '500',
      width: 28,
      marginRight: 24,
    },
    gridContainer: {
      flexDirection: 'row',
    },
    dayLabels: {
      width: 40,
      marginRight: 8,
    },
    dayLabel: {
      fontSize: 11,
      color: theme.text.secondary,
      height: 13,
      textAlign: 'right',
      fontWeight: '500',
    },
    container: {
      flexDirection: 'row',
      gap: 2,
    },
    week: {
      flexDirection: 'column',
      gap: 2,
    },
    day: {
      width: 10,
      height: 10,
      borderRadius: 2,
    },
  })

  return (
    <Surface style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.yearLabel}>{year}</Text>
        <View style={styles.monthLabels}>
          {months.map(({ name }, i) => (
            <Text key={i} style={styles.monthLabel}>
              {name}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.dayLabels}>
          {days.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.container}>
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
      </View>
    </Surface>
  )
} 