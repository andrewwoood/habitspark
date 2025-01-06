import * as React from 'react'
import { View, StyleSheet, TextInput } from 'react-native'
import { Text, Button, Avatar } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { AvatarUpload } from '../components/AvatarUpload'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import type { NavigationProps } from '../types/navigation'
import { useState } from 'react'
import { TextInput as PaperTextInput } from 'react-native-paper'

export const ProfileScreen = ({ navigation }: NavigationProps) => {
  const { user, logout, updateAvatar, avatarUrl, displayName, updateDisplayName } = useAuthStore()
  const currentStreak = useHabitStore(state => state.currentStreak)
  const achievements = React.useMemo(() => 
    getUnlockedAchievements(currentStreak), [currentStreak])
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(displayName || '')

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateAvatar(url)
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  const handleUpdateName = async () => {
    try {
      await updateDisplayName(newName)
      setEditing(false)
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarUpload size={100} onUpload={handleAvatarUpload} currentUrl={avatarUrl} />
        {editing ? (
          <PaperTextInput
            mode="outlined"
            value={newName}
            onChangeText={setNewName}
            onBlur={handleUpdateName}
            autoFocus
            style={styles.nameInput}
            right={<PaperTextInput.Icon icon="check" onPress={handleUpdateName} />}
          />
        ) : (
          <Text 
            variant="headlineMedium" 
            style={styles.displayName}
            onPress={() => setEditing(true)}
          >
            {displayName || 'Set Display Name'}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.email}>{user?.email}</Text>
      </View>
      <AchievementsList
        currentStreak={currentStreak}
        achievements={achievements}
      />
      <Button mode="contained" onPress={logout} style={styles.button}>
        Sign Out
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  email: {
    marginTop: 16,
  },
  button: {
    marginTop: 16,
  },
  nameInput: {
    width: '80%',
    marginTop: 16,
  },
  displayName: {
    marginTop: 16,
    marginBottom: 8,
  },
}) 