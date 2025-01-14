import * as React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { View, StyleSheet, ScrollView, Share, Alert, Platform, RefreshControl } from 'react-native'
import { Text, List, Button, ActivityIndicator, IconButton, Avatar, Snackbar, Surface, SegmentedButtons } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../api/supabaseClient'
import { generateInviteLink } from '../store/inviteStore'
import * as Clipboard from 'expo-clipboard'
import { useAppTheme } from '../theme/ThemeContext'
import { GroupHeader } from '../components/GroupHeader'
import { GroupMembers } from '../components/GroupMembers'
import { GroupActions } from '../components/GroupActions'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ErrorState } from '../components/ErrorState'
import { haptics } from '../utils/haptics'
import { HeatmapView } from '../components/HeatmapView'
import type { HabitStatistics } from '../utils/statisticsCalculator'

// First, add an interface for member data
interface MemberProfile {
  display_name: string
  avatar_url: string
}

const transformGroupStatsToHeatmapData = (
  groupStats: Array<{ date: string; completion_rate: number; member_count: number }>
): HabitStatistics['dailyCompletions'] => {
  return groupStats.map(stat => ({
    date: stat.date,
    percentage: stat.completion_rate
  }))
}

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
  
  // Format as "Oct 2024 - Present"
  const startLabel = startDate.toLocaleString('default', { 
    month: 'short',
    year: 'numeric'
  })
  
  return `${startLabel} - Present`
}

export const GroupDetailsScreen = ({ route, navigation }: NavigationProps<'GroupDetails'>) => {
  const { groupId } = route.params
  const { 
    groups, 
    loading, 
    error, 
    leaveGroup, 
    groupStats, 
    fetchGroupStats, 
    deleteGroup, 
    kickMember, 
    updateGroupStats
  } = useGroupStore()
  const group = useMemo(() => 
    groups.find(g => g.id === groupId), 
    [groups, groupId]
  )
  const { user } = useAuthStore()
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfile>>({})
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  const { theme, isDark } = useAppTheme()
  const [timeframe, setTimeframe] = useState('3m')
  const [isLeaving, setIsLeaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [kickingMemberId, setKickingMemberId] = useState<string | null>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch group stats when screen loads
  useEffect(() => {
    fetchGroupStats(groupId)
  }, [groupId])

  // Fetch member profiles
  const fetchMemberProfiles = useCallback(async () => {
      if (!group) return
      setLoadingProfiles(true)
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_profiles', {
            user_ids: group.members
          })

        if (error) throw error

        const profiles = data.reduce((acc, user) => ({
          ...acc,
          [user.id]: {
            display_name: user.display_name || 'Anonymous User',
            avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
          }
        }), {})

        setMemberProfiles(profiles)
      } catch (error) {
        console.error('Error fetching member profiles:', error)
      } finally {
        setLoadingProfiles(false)
      }
  }, [group])

  // Add effect to update stats when habits change
  useEffect(() => {
    if (!group) return

    const updateStats = async () => {
      try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0]
        
        // First fetch historical stats
        await fetchGroupStats(groupId)
        
        // Then update today's stats
        await updateGroupStats(groupId, today)
      } catch (error) {
        console.error('Error updating group stats:', error)
      }
    }

    updateStats()
  }, [group?.members.length, groupId]) // Update when member count changes or group ID changes

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm()
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: onConfirm,
          },
        ]
      )
    }
  }

  const handleError = (error: any, message: string) => {
    console.error(`${message}:`, error)
    if (Platform.OS === 'web') {
      window.alert(message)
    } else {
      Alert.alert('Error', message)
    }
  }

  const handleLeave = useCallback(() => {
    showConfirmDialog(
      'Leave Group',
      'Are you sure you want to leave this group?',
      async () => {
        setIsLeaving(true)
        try {
          await leaveGroup(groupId)
          haptics.success()
          navigation.goBack()
        } catch (error) {
          handleError(error, 'Failed to leave group')
          haptics.error()
        } finally {
          setIsLeaving(false)
        }
      }
    )
  }, [groupId, leaveGroup, navigation])

  const isGroupCreator = useMemo(() => 
    group?.created_by === user?.id,
    [group?.created_by, user?.id]
  )

  const handleKickMember = useCallback((memberId: string) => {
    showConfirmDialog(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      async () => {
        setKickingMemberId(memberId)
        try {
          await kickMember(groupId, memberId)
        } catch (error) {
          handleError(error, 'Failed to remove member')
        } finally {
          setKickingMemberId(null)
        }
      }
    )
  }, [groupId, kickMember])

  const handleDeleteGroup = useCallback(() => {
    showConfirmDialog(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      async () => {
        setIsDeleting(true)
        try {
          await deleteGroup(groupId)
          haptics.success()
          navigation.navigate('Groups')
        } catch (error) {
          handleError(error, 'Failed to delete group')
          haptics.error()
        } finally {
          setIsDeleting(false)
        }
      }
    )
  }, [groupId, deleteGroup, navigation])

  const handleCopyInviteLink = useCallback(async () => {
    setIsCopying(true)
    try {
      if (!groupId) throw new Error('Invalid group')
      const url = await generateInviteLink(groupId)
      if (!url) throw new Error('No URL generated')
      await Clipboard.setStringAsync(url)
      setShowCopiedMessage(true)
      haptics.success()
    } catch (error) {
      handleError(error, 'Failed to copy invite link')
      haptics.error()
    } finally {
      setIsCopying(false)
    }
  }, [groupId])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchGroupStats(groupId),
        fetchMemberProfiles(),
      ])
    } catch (error) {
      console.error('Error refreshing:', error)
    } finally {
      setRefreshing(false)
    }
  }, [groupId, fetchGroupStats, fetchMemberProfiles])

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Clean up any pending state updates
      setLoadingProfiles(false)
      setRefreshing(false)
      setIsCopying(false)
      setIsLeaving(false)
      setIsDeleting(false)
      setKickingMemberId(null)
    }
  }, [])

  // Add this useEffect after the fetchMemberProfiles definition
  useEffect(() => {
    fetchMemberProfiles()
  }, [fetchMemberProfiles])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Group not found</Text>
      </View>
    )
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={theme.text.primary}
              style={styles.backButton}
            />
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              Group Details
            </Text>
          </View>
          
          <Surface style={[styles.headerCard, { backgroundColor: theme.surface }]}>
            <Text variant="headlineMedium" style={[styles.groupName, { color: theme.text.primary }]}>
              {group.name}
            </Text>
            <View style={styles.codeContainer}>
              <Text style={[styles.codeLabel, { color: theme.text.secondary }]}>
                Group Code:
              </Text>
              <View style={styles.codeBox}>
                <Text style={[styles.codeText, { color: theme.text.primary }]}>
                  {group.code}
                </Text>
              </View>
            </View>
          </Surface>
        </View>

        <ScrollView 
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {error ? (
            <ErrorState 
              message={error} 
              onRetry={handleRefresh}
            />
          ) : (
            <>
              <Surface style={[styles.heatmapCard, { backgroundColor: theme.surface }]}>
                <View style={styles.heatmapHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                    Group Progress
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
                <HeatmapView 
                  dailyCompletions={transformGroupStatsToHeatmapData(groupStats[groupId] || [])}
                  timeframe={timeframe}
                  theme={theme}
                  isDark={isDark}
                />
              </Surface>

              <GroupMembers
                members={group.members}
                memberProfiles={memberProfiles}
                isGroupCreator={isGroupCreator}
                currentUserId={user?.id}
                onKickMember={handleKickMember}
                kickingMemberId={kickingMemberId}
                loadingProfiles={loadingProfiles}
              />

              <GroupActions
                isGroupCreator={isGroupCreator}
                onCopyInvite={handleCopyInviteLink}
                onLeave={handleLeave}
                onDelete={handleDeleteGroup}
                isCopying={isCopying}
                isLeaving={isLeaving}
                isDeleting={isDeleting}
              />
            </>
          )}
        </ScrollView>

        <Snackbar
          visible={showCopiedMessage}
          onDismiss={() => setShowCopiedMessage(false)}
          duration={2000}
        >
          Invite link copied to clipboard!
        </Snackbar>
      </View>
    </ErrorBoundary>
  )
}

// Keep static styles outside
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 16,
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
  headerContainer: {
    marginBottom: 16,
  },
  backButton: {
    marginLeft: -8,
    marginBottom: 8,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  codeBox: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
}) 