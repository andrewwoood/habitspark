import * as React from 'react'
import { useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, FAB, ActivityIndicator } from 'react-native-paper'
import { useHabitStore } from '../store/habitStore'
import { HeatmapView } from '../components/HeatmapView'
import { StreakDisplay } from '../components/StreakDisplay'
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator'
import { calculateStatistics } from '../utils/statisticsCalculator'
import type { NavigationProps } from '../types/navigation'
import { StreakMilestone } from '../components/StreakMilestone'
import { StatisticsView } from '../components/StatisticsView'

export const HomeScreen = ({ navigation }: NavigationProps) => {
  const { habits, loading, error, fetchHabits, toggleHabit, updateBestStreak } = useHabitStore()
  const [showMilestone, setShowMilestone] = React.useState(false)
  const lastStreak = React.useRef(0)

  useEffect(() => {
    fetchHabits()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  
  // Get all completed dates across all habits
  const allCompletedDates = habits.reduce((dates, habit) => {
    return [...dates, ...(habit.completed_dates || [])]
  }, [] as string[])

  // Count unique dates to calculate completion percentage
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
    calculateStatistics(uniqueCompletedDates), [uniqueCompletedDates])

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
            <HeatmapView completedDates={uniqueCompletedDates} />
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
                    icon={habit.completed_dates?.includes(today) ? 'check-circle' : 'circle-outline'}
                  />
                )}
                onPress={() => toggleHabit(habit.id, today)}
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