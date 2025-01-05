import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, FAB, ActivityIndicator } from 'react-native-paper'
import { useHabitStore } from '../store/habitStore.tsx'
import { HeatmapView } from '../components/HeatmapView'
import { StreakDisplay } from '../components/StreakDisplay'
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator'
import { calculateStatistics } from '../utils/statisticsCalculator'
import type { NavigationProps } from '../types/navigation'
import { StreakMilestone } from '../components/StreakMilestone'
import { StatisticsView } from '../components/StatisticsView'
import { useFocusEffect } from '@react-navigation/native'

export const HomeScreen = ({ navigation }: NavigationProps) => {
  const { habits, loading, error, fetchHabits, toggleHabit, updateBestStreak } = useHabitStore()
  const [showMilestone, setShowMilestone] = React.useState(false)
  const lastStreak = React.useRef(0)

  // Fetch habits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchHabits()
    }, [])
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  // Add this function to check if a date is today
  const isToday = (dateStr: string) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    return today === dateStr
  }

  // Get all completed dates across all habits
  const allCompletedDates = habits.reduce((dates, habit) => {
    // Filter out any invalid dates and ensure they're in YYYY-MM-DD format
    const validDates = (habit.completed_dates || []).filter(date => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }).map(date => new Date(date).toISOString().split('T')[0])
    
    return [...dates, ...validDates]
  }, [] as string[])

  // Keep uniqueCompletedDates for streak calculations only
  const uniqueCompletedDates = [...new Set(allCompletedDates)]

  // Calculate streaks from all completed dates
  const currentStreak = React.useMemo(() => {
    const streak = calculateStreak(uniqueCompletedDates)
    // Check for milestone (every 5 days)
    if (streak > lastStreak.current && streak % 5 === 0) {
      setShowMilestone(true)
      updateBestStreak(streak)
    }
    lastStreak.current = streak
    return streak
  }, [uniqueCompletedDates])
  const longestStreak = React.useMemo(() => 
    calculateLongestStreak(uniqueCompletedDates), [uniqueCompletedDates])

  const statistics = React.useMemo(() => 
    calculateStatistics(allCompletedDates, habits.length), [allCompletedDates, habits.length])

  const handleAddHabit = async () => {
    try {
      const newHabit = {
        name: 'Test Habit',
        frequency: 'daily',
        description: 'Test description'
      }
      console.log('Debug - Adding habit with data:', newHabit)
      await addHabit(newHabit)
    } catch (error) {
      console.error('Error adding habit:', error)
    }
  }

  if (loading && !habits.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StreakMilestone
        streak={currentStreak}
        visible={showMilestone}
        onClose={() => setShowMilestone(false)}
      />
      <Text variant="headlineSmall" style={styles.header}>Today's Habits</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <ScrollView>
        {habits.length > 0 && (
          <>
            <StreakDisplay
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
            <StatisticsView statistics={statistics} />
          </>
        )}
        {habits.length > 0 && (
          <View style={styles.heatmapContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Your Progress</Text>
            <HeatmapView dailyCompletions={statistics.dailyCompletions} />
          </View>
        )}
        
        <List.Section>
          <Text variant="titleMedium" style={styles.sectionTitle}>Habits</Text>
          {habits.length === 0 ? (
            <List.Item
              title="Add your first habit"
              left={props => <List.Icon {...props} icon="plus" />}
              onPress={() => navigation.navigate('CreateHabit')}
            />
          ) : (
            habits.map(habit => (
              <List.Item
                key={habit.id}
                title={habit.name}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={habit.completed_dates?.includes(todayStr) ? 'check-circle' : 'circle-outline'}
                  />
                )}
                onPress={() => toggleHabit(habit.id, todayStr)}
              />
            ))
          )}
        </List.Section>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHabit')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  heatmapContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}) 