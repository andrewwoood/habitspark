import * as React from 'react'
import { View, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native'
import { Text, Button, Avatar, TextInput as PaperTextInput, Card, IconButton, Portal, Modal } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { AvatarUpload } from '../components/AvatarUpload'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import type { NavigationProps } from '../types/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'
import { useAppTheme } from '../theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { haptics } from '../utils/haptics'

export const ProfileScreen = ({ navigation }: NavigationProps) => {
  const { theme, isDark } = useAppTheme()
  const { 
    user, 
    logout, 
    updateAvatar, 
    avatarUrl, 
    displayName, 
    updateDisplayName,
    syncUserProfile
  } = useAuthStore()
  const currentStreak = useHabitStore(state => state.currentStreak)
  const achievements = React.useMemo(() => 
    getUnlockedAchievements(currentStreak), [currentStreak])
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(displayName || '')
  const [loading, setLoading] = useState(true)
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false)
  const [newDisplayName, setNewDisplayName] = useState(displayName || '')

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      setLoading(true)
      
      try {
        const { data, error } = await supabase
          .rpc('get_user_profiles', {
            user_ids: [user.id]
          })

        if (error) throw error
        if (data && data[0]) {
          await updateDisplayName(data[0].display_name)
          await updateAvatar(data[0].avatar_url || user.user_metadata?.picture)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [user?.id]) // Only run when user ID changes

  // Add this effect to sync on mount
  useEffect(() => {
    syncUserProfile()
  }, [])

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateAvatar(url)
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  const handleUpdateName = async () => {
    if (!newDisplayName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Display name cannot be empty'
      })
      haptics.error()
      return
    }

    try {
      await updateDisplayName(newDisplayName.trim())
      setIsEditNameModalVisible(false)
      haptics.success()
      Toast.show({
        type: 'success',
        text1: 'Display name updated successfully'
      })
    } catch (error) {
      console.error('Error updating name:', error)
      haptics.error()
      Toast.show({
        type: 'error',
        text1: 'Failed to update display name'
      })
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.background,
      }
    ]}>
      <Card style={[styles.card, { backgroundColor: theme.surface }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <AvatarUpload 
              size={100} 
              onUpload={handleAvatarUpload} 
              currentUrl={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id}`} 
            />
          </View>
          <Text 
            variant="headlineMedium" 
            style={[styles.displayName, { color: theme.text.primary }]}
          >
            <View style={styles.displayNameContainer}>
              <TouchableOpacity 
                onPress={() => {
                  setNewDisplayName(displayName || '')
                  setIsEditNameModalVisible(true)
                }}
                style={styles.displayNameButton}
              >
                <Text 
                  variant="headlineMedium" 
                  style={[styles.displayName, { color: theme.text.primary }]}
                >
                  {displayName || 'Set Display Name'}
                </Text>
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor={theme.text.primary}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
          </Text>
          <Text 
            variant="bodyMedium" 
            style={[styles.email, { color: theme.text.secondary }]}
          >
            {user?.email}
          </Text>
        </Card.Content>
      </Card>
      <Card style={[styles.achievementsCard, { backgroundColor: theme.surface }]}>
        <Card.Title 
          title="Achievements" 
          left={(props) => (
            <Avatar.Icon 
              {...props} 
              icon="trophy" 
              color={theme.primary}
              style={{ backgroundColor: 'transparent' }}
            />
          )}
          titleStyle={[styles.cardTitle, { color: theme.text.primary }]}
        />
        <Card.Content>
          <AchievementsList
            currentStreak={currentStreak}
            achievements={achievements}
          />
        </Card.Content>
      </Card>
      <Button 
        mode="contained"
        onPress={logout} 
        style={[
          styles.button,
          { 
            backgroundColor: '#DC3545',  // Same as delete button
            marginTop: 'auto',
            marginBottom: 16,
          }
        ]}
        labelStyle={{ color: 'white' }}
      >
        Sign Out
      </Button>
      <Portal>
        <Modal
          visible={isEditNameModalVisible}
          onDismiss={() => setIsEditNameModalVisible(false)}
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
                Change Your Display Name
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setIsEditNameModalVisible(false)}
                iconColor={theme.text.primary}
              />
            </View>
            
            <PaperTextInput
              mode="outlined"
              placeholder="Enter display name..."
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              style={styles.modalInput}
              outlineColor="transparent"
              activeOutlineColor={theme.primary}
              textColor={theme.text.primary}
            />

            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setIsEditNameModalVisible(false)}
                style={styles.modalButton}
                labelStyle={{ color: theme.text.primary }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateName}
                style={[styles.modalButton, { backgroundColor: '#F4A460' }]}
                labelStyle={{ color: 'white' }}
              >
                Save Display Name
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    backdropFilter: 'blur(8px)',
  },
  headerContent: {
    maxWidth: 500,
    marginHorizontal: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: '600',
  },
  email: {
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    minWidth: 100,
  },
  nameInput: {
    width: '80%',
    marginTop: 16,
  },
  displayName: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  achievementsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarHint: {
    marginTop: 8,
    opacity: 0.7,
  },
  displayNameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  displayNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    margin: 0,
    padding: 0,
    marginLeft: 4,
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