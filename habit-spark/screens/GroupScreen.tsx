import * as React from 'react'
import { useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, FAB, ActivityIndicator } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'

export const GroupScreen = ({ navigation }: NavigationProps) => {
  const { groups, loading, error, fetchGroups } = useGroupStore()

  useEffect(() => {
    fetchGroups()
  }, [])

  if (loading && !groups.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>Your Groups</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <ScrollView>
        <List.Section>
          {groups.length === 0 ? (
            <List.Item
              title="Join or create a group"
              left={props => <List.Icon {...props} icon="account-group" />}
              onPress={() => navigation.navigate('CreateGroup')}
            />
          ) : (
            groups.map(group => (
              <List.Item
                key={group.id}
                title={group.name}
                description={`Group Code: ${group.code}`}
                left={props => <List.Icon {...props} icon="account-group" />}
                onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
              />
            ))
          )}
        </List.Section>
      </ScrollView>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
      />
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
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}) 