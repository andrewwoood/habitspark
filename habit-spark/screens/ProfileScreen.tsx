import * as React from 'react'
import { View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native'
import { Text, Button, Avatar, TextInput as PaperTextInput, Card } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'
import { useHabitStore } from '../store/habitStore'
import { AvatarUpload } from '../components/AvatarUpload'
import { AchievementsList } from '../components/AchievementsList'
import { getUnlockedAchievements } from '../utils/achievements'
import type { NavigationProps } from '../types/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'
import { useAppTheme } from '../theme/ThemeContext'

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
            {displayName || 'Set Display Name'}
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
        mode="outlined"
        onPress={logout} 
        style={styles.button}
        textColor={theme.text.primary}
        buttonColor={theme.surface}
      >
        Sign Out
      </Button>
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
    marginTop: 'auto',
    marginBottom: 16,
    borderRadius: 8,
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
}) 