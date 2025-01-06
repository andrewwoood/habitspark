import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface } from 'react-native-paper'

interface GroupHeatmapProps {
  completionData: {
    date: string
    completion_rate: number
    member_count: number
  }[]
}

export const GroupHeatmap = ({ completionData }: GroupHeatmapProps) => {
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
    if (new Date(date) > new Date()) return '#ebedf0'
    
    const dayData = completionData.find(d => d.date === date)
    if (!dayData || dayData.completion_rate === 0) {
      return '#ebedf0'
    }
    
    // Purple theme colors for group completion rate
    if (dayData.completion_rate <= 25) return '#E8DEF8'
    if (dayData.completion_rate <= 50) return '#B4A0E5'
    if (dayData.completion_rate <= 75) return '#8B6BC7'
    return '#6750A4'
  }

  const { weeks, days, months, year } = getDates()

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

const styles = StyleSheet.create({
  // Same styles as HeatmapView
  outerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 8,
  },
  headerContainer: {
    marginBottom: 12,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
    marginBottom: 8,
  },
  monthLabels: {
    flexDirection: 'row',
    paddingLeft: 48,
  },
  monthLabel: {
    fontSize: 11,
    color: '#57606a',
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
    color: '#57606a',
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