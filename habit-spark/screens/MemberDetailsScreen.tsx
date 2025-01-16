import * as React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Avatar, Card, ActivityIndicator, IconButton, Surface, SegmentedButtons } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'
import type { NavigationProps } from '../types/navigation'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import { useMemberStore } from '../store/memberStore'
import { HeatmapView } from '../components/HeatmapView'
import type { Habit } from '../store/habitStore'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { calculateStatistics } from '../utils/statisticsCalculator'

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
  const { 
    memberHabits, 
    memberProfile,
    currentStreak,
    loading,
    error,
    fetchMemberHabits,
    fetchMemberStreak,
    fetchMemberProfile,
    reset
  } = useMemberStore()

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

  React.useEffect(() => {
    const loadMemberDetails = async () => {
      try {
        await Promise.all([
          fetchMemberHabits(memberId),
          fetchMemberStreak(memberId),
          fetchMemberProfile(memberId)
        ])
      } catch (err) {
        console.error('Error loading member details:', err)
      }
    }

    loadMemberDetails()
    
    return () => {
      reset()
    }
  }, [memberId])

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

      <ScrollView>
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
            title="Achievements" 
            left={(props) => (
              <Avatar.Icon 
                {...props} 
                icon="trophy" 
                color={theme.primary}
                style={{ backgroundColor: 'transparent' }}
              />
            )}
            titleStyle={[styles.cardTitle, { color: theme.text.primary }]}
          />
          <Card.Content>
            <AchievementsList
              currentStreak={currentStreak}
              achievements={getUnlockedAchievements(currentStreak)}
            />
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
                const isCompletedToday = habit.completed_dates?.includes(
                  new Date().toISOString().split('T')[0]
                )

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginLeft: 16,
  },
  dateRange: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400',
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
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '400',
  },
}) 