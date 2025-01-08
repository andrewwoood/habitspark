import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, List, FAB, ActivityIndicator, Portal, Dialog, TextInput, Button } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'
import { joinGroupWithInvite } from '../store/inviteStore'

export const GroupScreen = ({ navigation }: NavigationProps) => {
  const { groups, loading, error, fetchGroups, joinGroup } = useGroupStore()
  const [joinDialogVisible, setJoinDialogVisible] = useState(false)
  const [input, setInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  React.useEffect(() => {
    fetchGroups()
  }, [])

  const handleJoinGroup = async () => {
    try {
      setJoining(true)
      const trimmedInput = input.trim()
      
      if (trimmedInput.includes('habitspark.app/invite/')) {
        const url = new URL(trimmedInput)
        const parts = url.pathname.split('/')
        const groupId = parts[parts.length - 2]
        const inviteCode = parts[parts.length - 1]
        await joinGroupWithInvite(groupId, inviteCode)
      } else {
        await joinGroup(trimmedInput.toUpperCase())
      }
      
      await fetchGroups()
      setJoinDialogVisible(false)
      setInput('')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setJoining(false)
    }
  }

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
              description="Get started by joining an existing group or creating your own"
              left={props => <List.Icon {...props} icon="account-group" />}
              onPress={() => setJoinDialogVisible(true)}
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

      <Portal>
        <Dialog visible={joinDialogVisible} onDismiss={() => setJoinDialogVisible(false)}>
          <Dialog.Title>Join Group</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Group Code or Invite Link"
              value={input}
              onChangeText={setInput}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setJoinDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleJoinGroup} 
              loading={joining}
              disabled={!input.trim()}
            >
              Join
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB.Group
        open={isOpen}
        visible
        onStateChange={({ open }) => setIsOpen(open)}
        actions={[
          {
            icon: 'account-group-outline',
            label: 'Join Group',
            onPress: () => setJoinDialogVisible(true),
          },
          {
            icon: 'plus',
            label: 'Create Group',
            onPress: () => navigation.navigate('CreateGroup'),
          },
        ]}
        icon={isOpen ? 'close' : 'plus'}
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
  input: {
    marginBottom: 16,
  },
}) 