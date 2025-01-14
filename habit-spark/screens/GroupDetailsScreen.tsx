import * as React from 'react'
import { useEffect, useState } from 'react'
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
  console.log('Leave Group Function:', leaveGroup)
  const group = groups.find(g => g.id === groupId)
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

  console.log('Current Group ID:', groupId)
  console.log('Found Group:', group)

  // Fetch group stats when screen loads
  useEffect(() => {
    fetchGroupStats(groupId)
  }, [groupId])

  // Fetch member profiles
  useEffect(() => {
    const fetchMemberProfiles = async () => {
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
    }

    fetchMemberProfiles()
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

  const handleLeave = () => {
    console.log('1. handleLeave called')
    
    showConfirmDialog(
      'Leave Group',
      'Are you sure you want to leave this group?',
      () => {
        console.log('2. Leave confirmed')
        setIsLeaving(true)
        console.log('3. Group ID for leaving:', groupId)
        
        leaveGroup(groupId)
          .then(() => {
            console.log('4. Leave group successful')
            navigation.goBack()
          })
          .catch((error) => {
            console.error('5. Leave group error:', error)
            if (Platform.OS === 'web') {
              window.alert(error.message || 'Failed to leave group')
            } else {
              Alert.alert('Error', error.message || 'Failed to leave group')
            }
          })
          .finally(() => {
            console.log('6. Leave group operation completed')
            setIsLeaving(false)
          })
      }
    )
  }

  const isGroupCreator = group?.created_by === user?.id

  const handleKickMember = (memberId: string) => {
    console.log('1. handleKickMember called')
    
    showConfirmDialog(
      'Remove Member',
      'Are you sure you want to remove this member from the group?',
      () => {
        console.log('2. Kick member confirmed')
        setKickingMemberId(memberId)
        console.log('3. Member ID for removal:', memberId)
        
        kickMember(groupId, memberId)
          .then(() => {
            console.log('4. Kick member successful')
          })
          .catch((error) => {
            console.error('5. Kick member error:', error)
            if (Platform.OS === 'web') {
              window.alert(error.message || 'Failed to remove member')
            } else {
              Alert.alert('Error', error.message || 'Failed to remove member')
            }
          })
          .finally(() => {
            console.log('6. Kick member operation completed')
            setKickingMemberId(null)
          })
      }
    )
  }

  const handleDeleteGroup = () => {
    console.log('1. handleDeleteGroup called')
    
    showConfirmDialog(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      () => {
        console.log('2. Delete confirmed')
        setIsDeleting(true)
        console.log('3. Group ID for deletion:', groupId)
        
        deleteGroup(groupId)
          .then(() => {
            console.log('4. Delete group successful')
            navigation.navigate('Groups')
          })
          .catch((error) => {
            console.error('5. Delete group error:', error)
            if (Platform.OS === 'web') {
              window.alert(error.message || 'Failed to delete group')
            } else {
              Alert.alert('Error', error.message || 'Failed to delete group')
            }
          })
          .finally(() => {
            console.log('6. Delete group operation completed')
            setIsDeleting(false)
          })
      }
    )
  }

  const handleCopyInviteLink = async () => {
    setIsCopying(true)
    
    try {
      if (!groupId) {
        throw new Error('Invalid group')
      }

      const url = await generateInviteLink(groupId)
      if (!url) {
        throw new Error('No URL generated')
      }

      await Clipboard.setStringAsync(url)
      setShowCopiedMessage(true)
      haptics.success()
    } catch (error) {
      console.error('Copy invite link error:', error)
      haptics.error()
      if (Platform.OS === 'web') {
        window.alert('Failed to copy invite link')
      } else {
        Alert.alert('Error', 'Failed to copy invite link')
      }
    } finally {
      setIsCopying(false)
    }
  }

  const handleRefresh = React.useCallback(async () => {
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
  }, [groupId])

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
      <View style={styles.container}>
        <GroupHeader
          name={group.name}
          code={group.code}
          onBack={() => navigation.goBack()}
        />

        <ScrollView 
          style={styles.scrollView}
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