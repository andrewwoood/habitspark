import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Achievement } from '../utils/achievements'
import { useAppTheme } from '../theme/ThemeContext'

interface AchievementsListProps {
  currentStreak: number
  achievements: Achievement[]
}

export const AchievementsList = ({ currentStreak, achievements }: AchievementsListProps) => {
  const { theme, isDark } = useAppTheme()
  
  return (
    <View style={styles.container}>
      {achievements.map(achievement => (
        <Surface 
          key={achievement.id}
          style={[
            styles.achievementItem,
            { 
              backgroundColor: theme.surface,
              elevation: 2,
              shadowColor: theme.shadow.color,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme.shadow.opacity,
              shadowRadius: 2,
            }
          ]}
        >
          <MaterialCommunityIcons
            name={achievement.icon}
            size={20}
            color={theme.primary}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text 
              variant="titleMedium"
              style={[styles.title, { color: theme.text.primary }]}
            >
              {achievement.title}
            </Text>
            <Text 
              variant="bodyMedium"
              style={[styles.description, { color: theme.text.secondary }]}
            >
              {achievement.description}
            </Text>
          </View>
        </Surface>
      ))}
      {achievements.length === 0 && (
        <Surface 
          style={[
            styles.achievementItem,
            { 
              backgroundColor: theme.surface,
              elevation: 2,
              shadowColor: theme.shadow.color,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme.shadow.opacity,
              shadowRadius: 2,
            }
          ]}
        >
          <MaterialCommunityIcons
            name="star-shooting-outline"
            size={20}
            color={theme.primary}
            style={styles.icon}
          />
          <Text style={[styles.empty, { color: theme.text.secondary }]}>
            Keep going! First achievement at 3 days.
          </Text>
        </Surface>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    fontSize: 14,
  },
}) 