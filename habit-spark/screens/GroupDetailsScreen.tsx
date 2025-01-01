import * as React from 'react'
import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, Button, ActivityIndicator } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import { useHabitStore } from '../store/habitStore'
import { GroupHeatmap } from '../components/GroupHeatmap'
import type { NavigationProps } from '../types/navigation'

export const GroupDetailsScreen = ({ route, navigation }: NavigationProps<'GroupDetails'>) => {
  const { groupId } = route.params
  const { groups, loading, error, leaveGroup } = useGroupStore()
  const { habits } = useHabitStore()
  const group = groups.find(g => g.id === groupId)

  // Calculate group completion data
  const completionData = React.useMemo(() => {
    if (!group || !habits.length) return {}
    
    const dateCompletions: { [date: string]: number } = {}
    group.members.forEach(memberId => {
      const memberHabits = habits.filter(h => h.user_id === memberId)
      memberHabits.forEach(habit => {
        habit.completed_dates?.forEach(date => {
          dateCompletions[date] = (dateCompletions[date] || 0) + 1
        })
      })
    })
    
    return dateCompletions
  }, [group, habits])

  const handleLeave = async () => {
    try {
      await leaveGroup(groupId)
      navigation.goBack()
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
          completionData={completionData}
          totalMembers={group.members.length}
        />
      </View>

      <Text variant="titleMedium" style={styles.membersHeader}>Members</Text>
      <ScrollView>
        <List.Section>
          {group.members.map(memberId => (
            <List.Item
              key={memberId}
              title={memberId} // In a real app, we'd fetch user details
              left={props => <List.Icon {...props} icon="account" />}
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
}) 