import * as React from 'react'
import { StyleSheet } from 'react-native'
import { Calendar, DateData } from 'react-native-calendars'
import { useTheme } from 'react-native-paper'

interface HeatmapProps {
  completedDates: string[]
  onDayPress?: (date: DateData) => void
}

export const HeatmapView = ({ completedDates, onDayPress }: HeatmapProps) => {
  const theme = useTheme()
  
  // Convert completed dates to calendar marking format
  const markedDates = completedDates.reduce((acc, date) => ({
    ...acc,
    [date]: {
      selected: true,
      selectedColor: theme.colors.primary,
    }
  }), {})

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
      onDayPress={onDayPress}
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