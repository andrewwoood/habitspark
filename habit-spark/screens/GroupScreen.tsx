import * as React from 'react'
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native'
import { Text, Button, Surface, IconButton, Portal, Modal, TextInput } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'
import { useAppTheme } from '../theme/ThemeContext'

export const GroupScreen = ({ navigation }: NavigationProps) => {
  const { groups, loading, error, fetchGroups, createGroup } = useGroupStore()
  const { theme } = useAppTheme()
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  React.useEffect(() => {
    fetchGroups()
  }, [])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    
    setIsCreating(true)
    try {
      await createGroup(newGroupName.trim())
      setIsModalVisible(false)
      setNewGroupName('')
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (loading && !groups.length) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.text.primary }]}>
            Groups
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => setIsModalVisible(true)}
          style={[styles.createButton]}
          icon="plus"
        >
          Create New Group
        </Button>

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Your Groups
        </Text>

        {error && (
          <Text style={[styles.error, { color: theme.error }]}>
            {error}
          </Text>
        )}

        <ScrollView style={styles.groupsList}>
          {groups.length === 0 ? (
            <Surface style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                Create or join your first group
              </Text>
            </Surface>
          ) : (
            groups.map(group => (
              <Surface 
                key={group.id} 
                style={[styles.groupCard, { backgroundColor: theme.surface }]}
              >
                <View style={styles.groupContent}>
                  <View style={styles.groupInfo}>
                    <Text style={[styles.groupName, { color: theme.text.primary }]}>
                      {group.name}
                    </Text>
                    <View style={styles.groupMeta}>
                      <Text style={[styles.groupCode, { backgroundColor: theme.primary + '20' }]}>
                        {group.code}
                      </Text>
                      <View style={styles.memberCount}>
                        <IconButton icon="account-group" size={16} />
                        <Text style={{ color: theme.text.secondary }}>{group.members.length}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.groupStats}>
                    <View style={styles.completionRate}>
                      <Text style={[styles.completionValue, { color: theme.text.primary }]}>
                        {group.completion_rate || 0}%
                      </Text>
                      <Text style={[styles.completionLabel, { color: theme.text.secondary }]}>
                        Completion
                      </Text>
                    </View>
                    <IconButton 
                      icon="chevron-right"
                      onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
                    />
                  </View>
                </View>
              </Surface>
            ))
          )}
        </ScrollView>

        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={() => {
              setIsModalVisible(false)
              setNewGroupName('')
            }}
            contentContainerStyle={[
              styles.modalContainer,
              { backgroundColor: theme.background }
            ]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text 
                  style={[styles.modalTitle, { color: theme.text.primary }]}
                >
                  Create New Group
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => {
                    setIsModalVisible(false)
                    setNewGroupName('')
                  }}
                  iconColor={theme.text.primary}
                />
              </View>
              
              <TextInput
                mode="outlined"
                placeholder="Enter group name..."
                value={newGroupName}
                onChangeText={setNewGroupName}
                style={styles.modalInput}
                outlineColor="transparent"
                activeOutlineColor={theme.primary}
                textColor={theme.text.primary}
                onSubmitEditing={handleCreateGroup}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="text"
                  onPress={() => {
                    setIsModalVisible(false)
                    setNewGroupName('')
                  }}
                  style={styles.modalButton}
                  labelStyle={{ color: theme.text.primary }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateGroup}
                  style={[styles.modalButton]}
                  loading={isCreating}
                  disabled={!newGroupName.trim() || isCreating}
                >
                  Create Group
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  createButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  groupsList: {
    flex: 1,
  },
  groupCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  groupContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupCode: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionRate: {
    alignItems: 'flex-end',
  },
  completionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  completionLabel: {
    fontSize: 12,
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    borderRadius: 20,
    minWidth: 100,
  },
}) 