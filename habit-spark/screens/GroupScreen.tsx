import * as React from 'react'
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Animated, TouchableOpacity } from 'react-native'
import { Text, Button, Surface, IconButton, Portal, Modal, TextInput } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'
import { useAppTheme } from '../theme/ThemeContext'

export const GroupScreen = ({ navigation }: NavigationProps) => {
  const { groups, loading, error, fetchGroups, createGroup, joinGroup } = useGroupStore()
  const { theme } = useAppTheme()
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [joinDialogVisible, setJoinDialogVisible] = React.useState(false)
  const [joinCode, setJoinCode] = React.useState('')
  const [isJoining, setIsJoining] = React.useState(false)
  
  const cardAnimationsMap = React.useRef(new Map()).current

  const getCardAnimationForGroup = (groupId: string) => {
    if (!cardAnimationsMap.has(groupId)) {
      cardAnimationsMap.set(groupId, new Animated.Value(1))
    }
    return cardAnimationsMap.get(groupId)
  }

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

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return
    
    setIsJoining(true)
    try {
      await joinGroup(joinCode.trim().toUpperCase())
      setJoinDialogVisible(false)
      setJoinCode('')
    } catch (error) {
      console.error('Error joining group:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const renderGroupCard = (group: Group) => {
    const cardAnimation = getCardAnimationForGroup(group.id)
    
    const handlePressIn = () => {
      Animated.spring(cardAnimation, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(cardAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View 
        key={group.id}
        style={[
          styles.groupCardContainer,
          { transform: [{ scale: cardAnimation }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <Surface style={[styles.groupCard, { backgroundColor: theme.surface }]}>
            <View style={styles.groupContent}>
              <View style={styles.groupInfo}>
                <Text style={[styles.groupName, { color: theme.text.primary }]}>
                  {group.name}
                </Text>
                <View style={styles.groupMeta}>
                  <Text style={[styles.groupCode, { backgroundColor: '#F0F0F0', color: '#666' }]}>
                    {group.code}
                  </Text>
                  <View style={styles.memberCount}>
                    <IconButton icon="account-group" size={16} iconColor={theme.text.secondary} />
                    <Text style={{ color: theme.text.secondary }}>{group.members.length}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.groupStats}>
                <View style={styles.completionRate}>
                  <Text style={[styles.completionValue, { color: '#8B4513' }]}>
                    {Math.round(group.completion_rate || 0)}%
                  </Text>
                  <Text style={[styles.completionLabel, { color: '#D2691E' }]}>
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
        </TouchableOpacity>
      </Animated.View>
    )
  }

  React.useEffect(() => {
    fetchGroups()
  }, [])

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

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setIsModalVisible(true)}
            style={[styles.createButton]}
            icon="plus"
            labelStyle={{ fontSize: 16 }}
            buttonColor="#F4A460"
          >
            Create New Group
          </Button>
          <Button
            mode="outlined"
            onPress={() => setJoinDialogVisible(true)}
            style={styles.joinButton}
            icon="account-group"
            textColor="#F4A460"
          >
            Join Group
          </Button>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Your Groups
        </Text>

        {error && (
          <Text style={[styles.error, { color: theme.error }]}>
            {error}
          </Text>
        )}

        <ScrollView style={styles.groupsList}>
          {groups.map(group => renderGroupCard(group))}
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

        <Portal>
          <Modal
            visible={joinDialogVisible}
            onDismiss={() => {
              setJoinDialogVisible(false)
              setJoinCode('')
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
                  Join Group
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => {
                    setJoinDialogVisible(false)
                    setJoinCode('')
                  }}
                  iconColor={theme.text.primary}
                />
              </View>
              
              <TextInput
                mode="outlined"
                placeholder="Enter group code..."
                value={joinCode}
                onChangeText={setJoinCode}
                style={styles.modalInput}
                outlineColor="transparent"
                activeOutlineColor={theme.primary}
                textColor={theme.text.primary}
                onSubmitEditing={handleJoinGroup}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="text"
                  onPress={() => {
                    setJoinDialogVisible(false)
                    setJoinCode('')
                  }}
                  style={styles.modalButton}
                  labelStyle={{ color: theme.text.primary }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleJoinGroup}
                  style={[styles.modalButton]}
                  loading={isJoining}
                  disabled={!joinCode.trim() || isJoining}
                >
                  Join Group
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
    marginBottom: 0,
    borderRadius: 8,
    height: 48,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: '#F0F0F0',
    color: '#666',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    color: '#8B4513',
  },
  completionLabel: {
    fontSize: 12,
    color: '#D2691E',
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
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  joinButton: {
    borderRadius: 8,
    height: 48,
    borderColor: '#F4A460',
    backgroundColor: 'white',
  },
  groupCardContainer: {
    marginVertical: 1,
  },
}) 