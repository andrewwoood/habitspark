import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import LottieView from 'lottie-react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { Achievement } from '../utils/achievements'

interface AchievementToastProps {
  achievement: Achievement
}

export const AchievementToast = ({ achievement }: AchievementToastProps) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confetti}
      />
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={achievement.icon}
          size={24}
          color="#FFD700"
        />
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.title}>
            Achievement Unlocked!
          </Text>
          <Text variant="bodyMedium">{achievement.title}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
}) 