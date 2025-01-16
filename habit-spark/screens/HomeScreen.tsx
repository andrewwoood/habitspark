import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Animated } from 'react-native'
import { Text, List, FAB, ActivityIndicator, Surface, SegmentedButtons, Button, IconButton, TextInput, Modal, Portal } from 'react-native-paper'
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
import Toast from 'react-native-toast-message'
import { haptics } from '../utils/haptics'

export const HomeScreen = ({ navigation }: NavigationProps) => {
  const { habits, loading, error, fetchHabits, toggleHabit, updateBestStreak, addHabit, updateHabit, deleteHabit } = useHabitStore()
  const [showMilestone, setShowMilestone] = React.useState(false)
  const lastStreak = React.useRef(0)
  const [timeframe, setTimeframe] = React.useState('3m')
  const { theme, isDark, toggleTheme } = useAppTheme()
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [newHabitName, setNewHabitName] = React.useState('')
  const [editModalVisible, setEditModalVisible] = React.useState(false)
  const [editingHabit, setEditingHabit] = React.useState<Habit | null>(null)
  const [editedHabitName, setEditedHabitName] = React.useState('')
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

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
    const habit = habits.find(h => h.id === habitId)
    const isCompleted = habit?.completed_dates?.includes(todayStr)
    
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

    try {
      // Toggle the habit
      await toggleHabit(habitId, todayStr)
      // Provide haptic feedback based on action
      if (isCompleted) {
        haptics.light() // Uncompleting
      } else {
        haptics.success() // Completing
      }
    } catch (error) {
      console.error('Error toggling habit:', error)
      haptics.error()
    }
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
          <View style={styles.habitItemContainer}>
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
            
            <IconButton
              icon="dots-vertical"
              size={20}
              iconColor={theme.text.secondary}
              onPress={() => {
                setEditingHabit(habit)
                setEditedHabitName(habit.name)
                setEditModalVisible(true)
              }}
            />
          </View>
        </Surface>
      </Animated.View>
    )
  }

  const showModal = () => setIsModalVisible(true)
  const hideModal = () => {
    setIsModalVisible(false)
    setNewHabitName('')
  }

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return
    
    try {
      await addHabit({
        name: newHabitName.trim(),
        description: '',
        frequency: 'daily',
      })
      haptics.success()
      hideModal()
    } catch (error) {
      console.error('Error creating habit:', error)
      haptics.error()
    }
  }

  const handleUpdateHabit = async () => {
    if (!editingHabit || !editedHabitName.trim()) return
    
    setIsUpdating(true)
    try {
      await updateHabit(editingHabit.id, { name: editedHabitName.trim() })
      setEditModalVisible(false)
      setEditingHabit(null)
      setEditedHabitName('')
      haptics.success()
      Toast.show({
        type: 'success',
        text1: 'Habit updated successfully'
      })
    } catch (error) {
      console.error('Error updating habit:', error)
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to update habit'
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteHabit = async () => {
    if (!editingHabit) return
    
    setIsDeleting(true)
    try {
      await deleteHabit(editingHabit.id)
      setEditModalVisible(false)
      setEditingHabit(null)
      setEditedHabitName('')
      setShowDeleteConfirm(false)
      haptics.warning() // Use warning for destructive actions
      Toast.show({
        type: 'success',
        text1: 'Habit deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting habit:', error)
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to delete habit'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Add a helper function to format the percentage
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0%'
    return `${Math.round(value)}%`
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
        </View>
        
        {/* Fixed Content */}
        <View style={styles.fixedContent}>
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            <Surface style={[styles.statsCard, { backgroundColor: theme.surface }]}>
              <Text 
                style={[styles.statsValue, { color: theme.text.primary }]}
              >
                {formatPercentage(statistics.weeklyAverage)}
              </Text>
              <Text 
                style={[styles.statsLabel, { color: theme.text.secondary }]}
              >
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
                style={[styles.segmentedButtons]}
                theme={{
                  colors: {
                    primary: theme.primary,
                    secondaryContainer: '#FFE4B5',
                    onSecondaryContainer: theme.text.primary,
                    onSurface: theme.text.secondary,
                    outline: 'transparent',
                    surface: '#FFF3E0',
                  },
                  roundness: 20,
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
              onPress={showModal}
              style={[styles.addButton]}
              labelStyle={[styles.addButtonLabel]}
              buttonColor="#FFE4B5"
              textColor={theme.text.primary}
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
                  Add your first habit above 👆
                </Text>
              </Surface>
            ) : (
              <View style={styles.habitsGrid}>
                {habits.map(habit => (
                  <View key={habit.id}>
                    {renderHabitItem(habit)}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={hideModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.background }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text 
                style={[styles.modalTitle, { color: theme.text.primary }]}
              >
                Add New Habit
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={hideModal}
                iconColor={theme.text.primary}
              />
            </View>
            
            <TextInput
              mode="outlined"
              placeholder="Enter habit name..."
              value={newHabitName}
              onChangeText={setNewHabitName}
              style={styles.modalInput}
              outlineColor="transparent"
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
              onSubmitEditing={handleCreateHabit}
            />

            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={hideModal}
                style={styles.modalButton}
                labelStyle={{ color: theme.text.primary }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateHabit}
                style={[styles.modalButton, { backgroundColor: '#F4A460' }]}
                labelStyle={{ color: 'white' }}
              >
                Add Habit
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => {
            setEditModalVisible(false)
            setEditingHabit(null)
            setEditedHabitName('')
          }}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.background }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                Edit Habit
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => {
                  setEditModalVisible(false)
                  setEditingHabit(null)
                  setEditedHabitName('')
                }}
                iconColor={theme.text.primary}
              />
            </View>
            
            <TextInput
              mode="outlined"
              placeholder="Enter habit name..."
              value={editedHabitName}
              onChangeText={setEditedHabitName}
              style={styles.modalInput}
              outlineColor="transparent"
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
            />

            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => {
                  setEditModalVisible(false)
                  setEditingHabit(null)
                  setEditedHabitName('')
                }}
                style={styles.modalButton}
                labelStyle={{ color: theme.text.primary }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowDeleteConfirm(true)}
                style={[styles.modalButton, { backgroundColor: '#DC3545' }]}
                labelStyle={{ color: 'white' }}
                loading={isDeleting}
                disabled={isDeleting || isUpdating}
              >
                Delete
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateHabit}
                style={[styles.modalButton, { backgroundColor: '#F4A460' }]}
                labelStyle={{ color: 'white' }}
                loading={isUpdating}
                disabled={isDeleting || isUpdating}
              >
                Save
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={showDeleteConfirm}
          onDismiss={() => setShowDeleteConfirm(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.background }
          ]}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Delete Habit
            </Text>
            <Text style={[styles.modalText, { color: theme.text.secondary }]}>
              Are you sure you want to delete this habit? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setShowDeleteConfirm(false)}
                style={styles.modalButton}
                labelStyle={{ color: theme.text.primary }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleDeleteHabit}
                style={[styles.modalButton, { backgroundColor: '#DC3545' }]}
                labelStyle={{ color: 'white' }}
                loading={isDeleting}
              >
                Delete
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
    borderRadius: 20,
    minHeight: 36,
    overflow: 'hidden',
    backgroundColor: '#FFF3E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  addButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
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
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    borderRadius: 20,
    minWidth: 100,
  },
  habitItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}) 