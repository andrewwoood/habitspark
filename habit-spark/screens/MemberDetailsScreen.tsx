import * as React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Avatar, Card, ActivityIndicator, IconButton, Surface, SegmentedButtons } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'
import type { NavigationProps } from '../types/navigation'
import { useHabitStore, type Habit } from '../store/habitStore.tsx'
import { HeatmapView } from '../components/HeatmapView'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { calculateStatistics } from '../utils/statisticsCalculator'
import { calculateStreak } from '../utils/streakCalculator'

interface MemberDetailsScreenProps extends NavigationProps<'MemberDetails'> {
  route: {
    params: {
      memberId: string
      displayName: string
      avatarUrl: string
    }
  }
}

export const MemberDetailsScreen = ({ navigation, route }: MemberDetailsScreenProps) => {
  const { memberId, displayName, avatarUrl } = route.params
  const { theme } = useAppTheme()
  const { fetchUserHabits } = useHabitStore()
  const [memberHabits, setMemberHabits] = React.useState<Habit[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [timeframe, setTimeframe] = React.useState('3m')

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
    
    const startLabel = startDate.toLocaleString('default', { 
      month: 'short',
      year: 'numeric'
    })
    
    return `${startLabel} - Present`
  }

  const statistics = React.useMemo(() => 
    calculateStatistics(
      memberHabits.reduce((dates, habit) => 
        [...dates, ...(habit.completed_dates || [])], 
      [] as string[]),
      memberHabits.length
    ), 
    [memberHabits]
  )

  const today = React.useMemo(() => 
    new Date().toISOString().split('T')[0],
    []
  )

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0%'
    return `${Math.round(value)}%`
  }

  React.useEffect(() => {
    const loadMemberDetails = async () => {
      try {
        setLoading(true)
        console.log('Loading member details for:', memberId)
        const habits = await fetchUserHabits(memberId)
        console.log('Received habits:', habits)
        setMemberHabits(habits)
      } catch (err) {
        console.error('Error loading member details:', err)
        setError(err instanceof Error ? err.message : 'Failed to load habits')
      } finally {
        setLoading(false)
      }
    }

    loadMemberDetails()
  }, [memberId, fetchUserHabits])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.text.error }}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.text.primary}
        />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Member Profile
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, { backgroundColor: theme.surface }]}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Image 
              size={100} 
              source={{ uri: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${memberId}` }} 
            />
            <Text 
              variant="headlineMedium" 
              style={[styles.displayName, { color: theme.text.primary }]}
            >
              {displayName}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={[styles.statsCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statsValue, { color: theme.text.primary }]}>
              {formatPercentage(statistics.weeklyAverage)}
            </Text>
            <Text style={[styles.statsLabel, { color: theme.text.secondary }]}>
              Last 7 Days
            </Text>
          </Card>

          <Card style={[styles.statsCard, { backgroundColor: theme.surface }]}>
            <View style={styles.streakValue}>
              <Text style={[styles.statsValue, { color: theme.text.primary }]}>
                {calculateStreak(
                  statistics.dailyCompletions
                    .filter(day => day.percentage > 0)
                    .map(day => day.date)
                )}
              </Text>
              <MaterialCommunityIcons 
                name="fire" 
                size={24} 
                color={theme.accent}
                style={styles.fireIcon} 
              />
            </View>
            <Text style={[styles.statsLabel, { color: theme.text.secondary }]}>
              Current Streak
            </Text>
          </Card>
        </View>

        <Card style={[styles.card, { backgroundColor: theme.surface }]}>
          <Card.Content>
            <View style={styles.heatmapHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Progress
              </Text>
              <SegmentedButtons
                value={timeframe}
                onValueChange={setTimeframe}
                buttons={[
                  { value: '1m', label: '1M' },
                  { value: '3m', label: '3M' },
                  { value: '6m', label: '6M' },
                ]}
                style={styles.segmentedButtons}
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
            
            {memberHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  No habits to display
                </Text>
              </View>
            ) : (
              <HeatmapView 
                dailyCompletions={statistics.dailyCompletions}
                timeframe={timeframe}
                theme={theme}
                isDark={false}
              />
            )}
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.surface }]}>
          <Card.Title 
            title="Habits" 
            titleStyle={[styles.cardTitle, { color: theme.text.primary }]}
          />
          <Card.Content>
            {memberHabits.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                  No habits yet
                </Text>
              </View>
            ) : (
              memberHabits.map(habit => {
                const isCompletedToday = habit.completed_dates?.includes(today)

                return (
                  <Surface 
                    key={habit.id} 
                    style={[styles.habitItem, { backgroundColor: theme.surface }]}
                  >
                    <View style={styles.habitItemContent}>
                      <View style={[
                        styles.checkbox,
                        { borderColor: theme.primary },
                        isCompletedToday && { 
                          backgroundColor: theme.primary,
                          borderColor: theme.primary 
                        }
                      ]}>
                        {isCompletedToday && (
                          <MaterialCommunityIcons 
                            name="check" 
                            size={16} 
                            color={theme.surface} 
                          />
                        )}
                      </View>
                      <Text style={[styles.habitName, { color: theme.text.primary }]}>
                        {habit.name}
                      </Text>
                    </View>
                  </Surface>
                )
              })
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  displayName: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  habitItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginHorizontal: 2,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginLeft: 16,
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
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
  },
  habitItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
}) 