import * as React from 'react'
import { StyleSheet } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { useTheme } from 'react-native-paper'

interface GroupHeatmapProps {
  completionData: { [date: string]: number }  // percentage of members who completed habits
  totalMembers: number
}

export const GroupHeatmap = ({ completionData, totalMembers }: GroupHeatmapProps) => {
  const theme = useTheme()
  
  // Convert completion data to calendar marking format with color intensity
  const markedDates = Object.entries(completionData).reduce((acc, [date, completions]) => {
    const percentage = (completions / totalMembers) * 100
    let color = theme.colors.primary
    let alpha = 0.3

    if (percentage >= 75) alpha = 1
    else if (percentage >= 50) alpha = 0.7
    else if (percentage >= 25) alpha = 0.5

    return {
      ...acc,
      [date]: {
        selected: true,
        selectedColor: color + Math.round(alpha * 255).toString(16).padStart(2, '0'),
      }
    }
  }, {})

  return (
    <Calendar
      style={styles.calendar}
      theme={{
        backgroundColor: 'transparent',
        calendarBackground: 'transparent',
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.onPrimary,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.onBackground,
        monthTextColor: theme.colors.onBackground,
        textDisabledColor: theme.colors.outline,
      }}
      markedDates={markedDates}
      enableSwipeMonths
      hideExtraDays
    />
  )
}

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: 'transparent',
  },
}) 