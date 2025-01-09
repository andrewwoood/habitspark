import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated } from 'react-native'
import { Text, List, FAB, ActivityIndicator, Surface, SegmentedButtons, Button, IconButton } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useHabitStore } from '../store/habitStore.tsx'
import { HeatmapView } from '../components/HeatmapView'
import { StreakDisplay } from '../components/StreakDisplay'
import { calculateStreak, calculateLongestStreak } from '../utils/streakCalculator'
import { calculateStatistics } from '../utils/statisticsCalculator'
import type { NavigationProps } from '../types/navigation'
import { StreakMilestone } from '../components/StreakMilestone'
import { StatisticsView } from '../components/StatisticsView'
import { useFocusEffect } from '@react-navigation/native'
import { useAppTheme } from '../theme/ThemeContext'

export const HomeScreen = ({ navigation }: NavigationProps) => {
  const { habits, loading, error, fetchHabits, toggleHabit, updateBestStreak } = useHabitStore()
  const [showMilestone, setShowMilestone] = React.useState(false)
  const lastStreak = React.useRef(0)
  const [timeframe, setTimeframe] = React.useState('6m')
  const { theme, isDark, toggleTheme } = useAppTheme()

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

  // Add this helper function
  const getTimeframeLabel = (timeframe: string) => {
    const now = new Date()
    const startDate = new Date()
    
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
    
    startDate.setDate(1) // First day of start month
    
    const startLabel = startDate.toLocaleString('default', { 
      month: 'short',
      year: 'numeric'
    })
    
    return `${startLabel} - Present`
  }

  // Create a map to store animations for each habit
  const animationsMap = React.useRef(new Map()).current

  const getAnimationForHabit = (habitId: string) => {
    if (!animationsMap.has(habitId)) {
      animationsMap.set(habitId, new Animated.Value(0))
    }
    return animationsMap.get(habitId)
  }

  const handleHabitToggle = async (habitId: string) => {
    const animation = getAnimationForHabit(habitId)
    
    // Start scale animation
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start()

    // Toggle the habit
    await toggleHabit(habitId, todayStr)
  }

  // First, add a new animation map for card press states
  const cardAnimationsMap = React.useRef(new Map()).current

  const getCardAnimationForHabit = (habitId: string) => {
    if (!cardAnimationsMap.has(habitId)) {
      cardAnimationsMap.set(habitId, new Animated.Value(1))
    }
    return cardAnimationsMap.get(habitId)
  }

  // Update the renderHabitItem function
  const renderHabitItem = (habit: Habit) => {
    const isCompleted = habit.completed_dates?.includes(todayStr)
    const checkAnimation = getAnimationForHabit(habit.id)
    const cardAnimation = getCardAnimationForHabit(habit.id)
    
    const handlePressIn = () => {
      Animated.spring(cardAnimation, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(cardAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View style={[
        styles.habitCardContainer,
        {
          transform: [{
            scale: cardAnimation
          }]
        }
      ]}>
        <Surface style={[styles.habitCard, { backgroundColor: theme.surface }]}>
          <TouchableOpacity 
            style={styles.habitItem}
            onPress={() => handleHabitToggle(habit.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Animated.View style={[
              styles.checkbox,
              { borderColor: theme.primary },
              isCompleted && { 
                backgroundColor: theme.primary,
                borderColor: theme.primary 
              },
              {
                transform: [{
                  scale: checkAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1]
                  })
                }]
              }
            ]}>
              {isCompleted && (
                <Animated.View style={{
                  opacity: checkAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0]
                  })
                }}>
                  <MaterialCommunityIcons name="check" size={16} color={theme.surface} />
                </Animated.View>
              )}
            </Animated.View>
            <Text style={[styles.habitName, { color: theme.text.primary }]}>
              {habit.name}
            </Text>
          </TouchableOpacity>
        </Surface>
      </Animated.View>
    )
  }

  if (loading && !habits.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6750A4" />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.text.primary }]}>
            Habits
          </Text>
          <IconButton
            icon={isDark ? 'weather-sunny' : 'weather-night'}
            iconColor={theme.text.primary}
            onPress={toggleTheme}
          />
        </View>
        
        {/* Fixed Content */}
        <View style={styles.fixedContent}>
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Surface style={[styles.statsCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statsValue, { color: theme.text.primary }]}>
                {statistics.completionRate}%
              </Text>
              <Text style={[styles.statsLabel, { color: theme.text.secondary }]}>
                Last 7 Days
              </Text>
            </Surface>

            <Surface style={[styles.statsCard, { backgroundColor: theme.surface }]}>
              <View style={styles.streakValue}>
                <Text style={[styles.statsValue, { color: theme.text.primary }]}>{longestStreak}</Text>
                <MaterialCommunityIcons 
                  name="fire" 
                  size={24} 
                  color={theme.accent}
                  style={styles.fireIcon} 
                />
              </View>
              <Text style={[styles.statsLabel, { color: theme.text.secondary }]}>Longest Streak</Text>
            </Surface>
          </View>

          {/* Heatmap Section */}
          <Surface style={[styles.heatmapCard, { backgroundColor: theme.surface }]}>
            <View style={styles.heatmapHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Your Progress</Text>
              <SegmentedButtons
                value={timeframe}
                onValueChange={setTimeframe}
                buttons={[
                  { value: '1m', label: '1M' },
                  { value: '3m', label: '3M' },
                  { value: '6m', label: '6M' },
                ]}
                style={[styles.segmentedButtons, { backgroundColor: theme.background }]}
                theme={{
                  colors: {
                    primary: theme.primary,
                    secondaryContainer: theme.background,
                    onSecondaryContainer: theme.text.primary,
                    onSurface: theme.text.secondary,
                    outline: theme.text.secondary + '40',
                  },
                  roundness: 8,
                }}
                density="medium"
              />
            </View>
            <Text style={[styles.dateRange, { color: theme.text.secondary }]}>
              {getTimeframeLabel(timeframe)}
            </Text>
            <HeatmapView 
              dailyCompletions={statistics.dailyCompletions} 
              timeframe={timeframe}
              theme={theme}
              isDark={isDark}
            />
          </Surface>
        </View>

        {/* Scrollable Habits List */}
        <View style={styles.habitsContainer}>
          <View style={styles.habitsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Today's Habits</Text>
            <Button 
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('CreateHabit')}
              style={[styles.addButton, { backgroundColor: theme.background }]}
              labelStyle={[styles.addButtonLabel, { color: theme.text.primary }]}
            >
              Add Habit
            </Button>
          </View>

          <ScrollView 
            style={styles.habitsList}
            contentContainerStyle={styles.habitsListContent}
            showsVerticalScrollIndicator={false}
          >
            {habits.length === 0 ? (
              <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  Add your first habit
                </Text>
              </Surface>
            ) : (
              <View style={styles.habitsGrid}>
                {habits.map(habit => renderHabitItem(habit))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 0,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  streakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireIcon: {
    marginLeft: 4,
  },
  heatmapCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentedButtons: {
    borderRadius: 8,
    minHeight: 36,
    overflow: 'hidden',
  },
  dateRange: {
    fontSize: 12,
    marginBottom: 12,
  },
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 20,
  },
  addButtonLabel: {
    fontSize: 14,
  },
  habitsList: {
    flex: 1,
  },
  habitCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  habitName: {
    fontSize: 16,
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
  },
  fixedContent: {
    marginBottom: 16,
  },
  habitsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitsListContent: {
    paddingBottom: 80,
  },
  habitsGrid: {
    gap: 12,
  },
  habitCardContainer: {
    marginVertical: 1,
  },
}) 