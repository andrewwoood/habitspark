import * as React from 'react'
import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, Button, ActivityIndicator, IconButton } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import { GroupHeatmap } from '../components/GroupHeatmap'
import type { NavigationProps } from '../types/navigation'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../api/supabaseClient'

export const GroupDetailsScreen = ({ route, navigation }: NavigationProps<'GroupDetails'>) => {
  const { groupId } = route.params
  const { groups, loading, error, leaveGroup, groupStats, fetchGroupStats, deleteGroup, kickMember } = useGroupStore()
  const group = groups.find(g => g.id === groupId)
  const { user } = useAuthStore()
  const [memberNames, setMemberNames] = useState<Record<string, string>>({})
  
  // Fetch group stats when screen loads
  useEffect(() => {
    fetchGroupStats(groupId)
  }, [groupId])

  // Fetch member display names
  useEffect(() => {
    const fetchMemberNames = async () => {
      if (!group) return
      
      const { data, error } = await supabase
        .from('users')
        .select('id, raw_user_meta_data->display_name')
        .in('id', group.members)

      if (error) {
        console.error('Error fetching member names:', error)
        return
      }

      const names = data.reduce((acc, user) => ({
        ...acc,
        [user.id]: user.raw_user_meta_data.display_name
      }), {})

      setMemberNames(names)
    }

    fetchMemberNames()
  }, [group])

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
              title={memberNames[memberId] || 'Loading...'}
              left={props => <List.Icon {...props} icon="account" />}
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
}) 