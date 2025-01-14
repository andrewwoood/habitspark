import * as React from 'react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { View, StyleSheet, ScrollView, Share, Alert, Platform, RefreshControl } from 'react-native'
import { Text, List, Button, ActivityIndicator, IconButton, Avatar, Snackbar, Surface, SegmentedButtons } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import { GroupHeatmap } from '../components/GroupHeatmap'
import type { NavigationProps } from '../types/navigation'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../api/supabaseClient'
import { generateInviteLink } from '../store/inviteStore'
import * as Clipboard from 'expo-clipboard'
import { useAppTheme } from '../theme/ThemeContext'
import { GroupHeader } from '../components/GroupHeader'
import { GroupProgress } from '../components/GroupProgress'
import { GroupMembers } from '../components/GroupMembers'
import { GroupActions } from '../components/GroupActions'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ErrorState } from '../components/ErrorState'
import { haptics } from '../utils/haptics'

// First, add an interface for member data
interface MemberProfile {
  display_name: string
  avatar_url: string
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
            navigation.goBack()
        } catch (error) {
          handleError(error, 'Failed to leave group')
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
            navigation.navigate('Groups')
        } catch (error) {
          handleError(error, 'Failed to delete group')
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
    } catch (error) {
      handleError(error, 'Failed to copy invite link')
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
        <GroupHeader
          name={group.name}
          code={group.code}
          onBack={() => navigation.goBack()}
        />

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
              <GroupProgress
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                groupId={groupId}
                completionData={groupStats[groupId] || []}
              />

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
}) 