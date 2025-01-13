import * as React from 'react'
import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Share, Alert, Platform } from 'react-native'
import { Text, List, Button, ActivityIndicator, IconButton, Avatar, Snackbar, Surface, SegmentedButtons } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import { GroupHeatmap } from '../components/GroupHeatmap'
import type { NavigationProps } from '../types/navigation'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../api/supabaseClient'
import { generateInviteLink } from '../store/inviteStore'
import * as Clipboard from 'expo-clipboard'
import { useAppTheme } from '../theme/ThemeContext'

// First, add an interface for member data
interface MemberProfile {
  display_name: string
  avatar_url: string
}

// First, let's create a type-safe theme color reference
const getDateRangeColor = (theme: any) => {
  try {
    return theme?.colors?.onSurfaceVariant || '#666666'
  } catch (e) {
    return '#666666' // Fallback color
  }
}

// Add this helper function alongside the other one at the top
const getSegmentedButtonColors = (theme: any) => {
  try {
    return {
      secondaryContainer: theme?.colors?.surfaceVariant || '#f0f0f0',
      onSecondaryContainer: theme?.colors?.onSurfaceVariant || '#666666'
    }
  } catch (e) {
    return {
      secondaryContainer: '#f0f0f0',  // Fallback light color
      onSecondaryContainer: '#666666' // Fallback text color
    }
  }
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
    console.log('1. Copy invite link called')
    setIsCopying(true)
    
    try {
      console.log('2. Generating invite link for group:', groupId)
      if (!groupId) {
        throw new Error('Invalid group')
      }

      const url = await generateInviteLink(groupId)
      console.log('3. Generated URL:', url)
      
      if (!url) {
        throw new Error('No URL generated')
      }

      await Clipboard.setStringAsync(url)
      console.log('4. Copied to clipboard successfully')
      setShowCopiedMessage(true)
    } catch (error) {
      console.error('5. Copy invite link error:', error)
      if (Platform.OS === 'web') {
        window.alert('Failed to copy invite link')
      } else {
        Alert.alert('Error', 'Failed to copy invite link')
      }
    } finally {
      console.log('6. Copy operation completed')
      setIsCopying(false)
    }
  }

  const getTimeframeLabel = () => {
    const now = new Date()
    let startDate = new Date()
    
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

    return `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - Present`
  }

  // Create dynamic styles with fallback
  const dynamicStyles = {
    dateRange: {
      fontSize: 12,
      color: getDateRangeColor(theme),
      marginBottom: 12,
    }
  }

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
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
        />
        <Text variant="headlineSmall">Group Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Group Info Card */}
        <Surface style={styles.card}>
          <Text variant="headlineMedium" style={styles.groupName}>
            {group.name}
          </Text>
          <View style={styles.codeContainer}>
            <Text variant="bodyMedium">Group Code: </Text>
            <Text variant="bodyMedium" style={styles.codeText}>
              {group.code}
            </Text>
          </View>
        </Surface>

        {/* Group Progress Card */}
        <Surface style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
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
                colors: getSegmentedButtonColors(theme)
              }}
            />
          </View>
          <Text style={dynamicStyles.dateRange}>
            {getTimeframeLabel()}
          </Text>
          <GroupHeatmap 
            completionData={groupStats[groupId] || []}
            timeframe={timeframe}
          />
        </Surface>

        {/* Members Card */}
        <Surface style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Members
          </Text>
          {loadingProfiles ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            group.members.map(memberId => (
              <List.Item
                key={memberId}
                title={memberProfiles[memberId]?.display_name || 'Anonymous User'}
                left={() => (
                  <Avatar.Image
                    size={40}
                    source={{ uri: memberProfiles[memberId]?.avatar_url }}
                  />
                )}
                right={() => 
                  isGroupCreator && memberId !== user?.id ? (
                    <IconButton 
                      icon="account-remove"
                      onPress={() => handleKickMember(memberId)}
                      disabled={kickingMemberId === memberId}
                      loading={kickingMemberId === memberId}
                    />
                  ) : null
                }
                style={styles.memberItem}
              />
            ))
          )}
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleCopyInviteLink}
            style={[styles.actionButton, styles.primaryButton]}
            loading={isCopying}
            disabled={isCopying}
          >
            {isCopying ? 'Copying...' : 'Copy Invite Link'}
          </Button>

          <Button
            mode="contained"
            onPress={() => {
              console.log('Button clicked')
              handleLeave()
            }}
            style={[styles.actionButton, styles.dangerButton]}
            loading={isLeaving}
            disabled={isLeaving}
            buttonColor="#FF4444"
          >
            {isLeaving ? 'Leaving...' : 'Leave Group'}
          </Button>

          {isGroupCreator && (
            <Button
              mode="contained"
              onPress={handleDeleteGroup}
              style={[styles.actionButton, styles.dangerButton]}
              loading={isDeleting}
              disabled={isDeleting}
              buttonColor="#FF4444"
            >
              {isDeleting ? 'Deleting...' : 'Delete Group'}
            </Button>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={showCopiedMessage}
        onDismiss={() => setShowCopiedMessage(false)}
        duration={2000}
      >
        Invite link copied to clipboard!
      </Snackbar>
    </View>
  )
}

// Keep static styles outside
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  groupName: {
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontWeight: 'bold',
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
  membersHeader: {
    marginBottom: 16,
  },
  leaveButton: {
    marginTop: 16,
  },
  heatmapContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 16,
  },
  avatar: {
    marginRight: 16,
  },
  inviteButton: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 20,
  },
  memberItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 100,
  },
  dangerButton: {
    backgroundColor: '#FF4444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentedButtons: {
    height: 32,
  },
  primaryButton: {
    backgroundColor: '#6750A4',
  },
}) 