import * as React from 'react'
import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, Share, Clipboard } from 'react-native'
import { Text, List, Button, ActivityIndicator, IconButton, Avatar, Snackbar } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import { GroupHeatmap } from '../components/GroupHeatmap'
import type { NavigationProps } from '../types/navigation'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../api/supabaseClient'

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
    updateGroupStats,  // Make sure this is included
    generateInviteLink,  // Added generateInviteLink
    getInviteUrl  // Add this
  } = useGroupStore()
  const group = groups.find(g => g.id === groupId)
  const { user } = useAuthStore()
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfile>>({})
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)
  
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

  const handleLeave = async () => {
    try {
      await leaveGroup(groupId)
      navigation.goBack()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const isGroupCreator = group?.created_by === user?.id

  const handleKickMember = async (memberId: string) => {
    try {
      await kickMember(groupId, memberId)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(groupId)
      navigation.navigate('Groups')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleShare = async () => {
    try {
      const inviteMessage = `Join my habit group "${group.name}" in HabitSpark!\nGroup Code: ${group.code}`
      await Share.share({
        message: inviteMessage
      })
    } catch (error) {
      // If share fails, copy to clipboard instead
      Clipboard.setString(group.code)
      alert('Group code copied to clipboard!')
    }
  }

  const handleCopyInviteLink = () => {
    const inviteUrl = getInviteUrl(groupId)
    Clipboard.setString(inviteUrl)
    setShowCopiedMessage(true)
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
      <Text variant="headlineSmall" style={styles.header}>{group.name}</Text>
      <Text variant="titleMedium" style={styles.code}>Group Code: {group.code}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.heatmapContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Group Progress</Text>
        <GroupHeatmap 
          completionData={groupStats[groupId] || []}
        />
      </View>

      <Text variant="titleMedium" style={styles.membersHeader}>Members</Text>
      <ScrollView>
        <List.Section>
          {group.members.map(memberId => (
            <List.Item
              key={memberId}
              title={memberProfiles[memberId]?.display_name || 'Loading...'}
              left={props => (
                <Avatar.Image
                  size={40}
                  source={{ uri: memberProfiles[memberId]?.avatar_url }}
                  style={styles.avatar}
                />
              )}
              right={props => 
                isGroupCreator && memberId !== user?.id ? (
                  <IconButton 
                    {...props} 
                    icon="account-remove" 
                    onPress={() => handleKickMember(memberId)}
                  />
                ) : null
              }
            />
          ))}
        </List.Section>
      </ScrollView>
      
      <Button
        mode="contained"
        onPress={handleLeave}
        style={styles.leaveButton}
        buttonColor="#ff4444"
      >
        Leave Group
      </Button>

      {isGroupCreator && (
        <Button
          mode="contained"
          onPress={handleDeleteGroup}
          style={styles.deleteButton}
          buttonColor="#ff4444"
        >
          Delete Group
        </Button>
      )}

      <Button
        mode="outlined"
        onPress={handleCopyInviteLink}
        style={styles.inviteButton}
        icon="link"
      >
        Copy Invite Link
      </Button>

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
    marginBottom: 8,
  },
  code: {
    marginBottom: 24,
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
}) 