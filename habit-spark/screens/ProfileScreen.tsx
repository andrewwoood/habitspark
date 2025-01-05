import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Avatar } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { AvatarUpload } from '../components/AvatarUpload'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import type { NavigationProps } from '../types/navigation'

export const ProfileScreen = ({ navigation }: NavigationProps) => {
  const { user, logout, updateAvatar, avatarUrl } = useAuthStore()
  const currentStreak = useHabitStore(state => state.currentStreak)
  const achievements = React.useMemo(() => 
    getUnlockedAchievements(currentStreak), [currentStreak])

  const handleAvatarUpload = async (url: string) => {
    try {
      await updateAvatar(url)
    } catch (error) {
      console.error('Error updating avatar:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarUpload size={100} onUpload={handleAvatarUpload} currentUrl={avatarUrl} />
        <Text variant="titleLarge" style={styles.email}>{user?.email}</Text>
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
}) 