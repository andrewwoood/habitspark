import * as React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Text, Button, Avatar, TextInput as PaperTextInput } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { AvatarUpload } from '../components/AvatarUpload'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import type { NavigationProps } from '../types/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'

export const ProfileScreen = ({ navigation }: NavigationProps) => {
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

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      setLoading(true)
      
      try {
        console.log('Current user metadata:', user.user_metadata)  // Debug log
        
        const { data, error } = await supabase
          .rpc('get_user_profiles', {
            user_ids: [user.id]
          })

        console.log('Profile data:', data)  // Debug log

        if (error) throw error
        if (data && data[0]) {
          await updateProfile({
            displayName: data[0].display_name,
            avatarUrl: data[0].avatar_url || user.user_metadata?.picture  // Add Google picture fallback
          })
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
    try {
      await updateDisplayName(newName)
      setEditing(false)
    } catch (error) {
      console.error('Error updating name:', error)
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
    <View style={styles.container}>
      <View style={styles.header}>
        <AvatarUpload 
          size={100} 
          onUpload={handleAvatarUpload} 
          currentUrl={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.id}`} 
        />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  email: {
    marginTop: 8,
    opacity: 0.7,
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