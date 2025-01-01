import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { List, Text } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Achievement } from '../utils/achievements'

interface AchievementsListProps {
  currentStreak: number
  achievements: Achievement[]
}

export const AchievementsList = ({ currentStreak, achievements }: AchievementsListProps) => {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Achievements</Text>
      {achievements.map(achievement => (
        <List.Item
          key={achievement.id}
          title={achievement.title}
          description={achievement.description}
          left={props => (
            <MaterialCommunityIcons
              name={achievement.icon}
              size={24}
              color="#FFD700"
              style={styles.icon}
            />
          )}
        />
      ))}
      {achievements.length === 0 && (
        <Text style={styles.empty}>Keep going! First achievement at 3 days.</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  icon: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
}) 