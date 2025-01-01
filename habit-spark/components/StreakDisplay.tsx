import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
}

export const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.streakCard}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B6B" />
        <Text variant="titleMedium" style={styles.streakText}>
          Current Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
        </Text>
      </Surface>
      <Surface style={styles.streakCard}>
        <MaterialCommunityIcons name="trophy" size={24} color="#FFD93D" />
        <Text variant="titleMedium" style={styles.streakText}>
          Best Streak: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </Text>
      </Surface>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    margin: 4,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  streakText: {
    marginLeft: 8,
  },
}) 