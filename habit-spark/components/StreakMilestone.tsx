import * as React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface StreakMilestoneProps {
  streak: number
  visible: boolean
  onClose: () => void
}

export const StreakMilestone = ({ streak, visible, onClose }: StreakMilestoneProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => onClose())
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Surface style={styles.milestone}>
        <MaterialCommunityIcons name="fire" size={32} color="#FF6B6B" />
        <View style={styles.textContainer}>
          <Text variant="headlineSmall">🎉 {streak} Day Streak!</Text>
          <Text variant="bodyMedium">Keep up the great work!</Text>
        </View>
      </Surface>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  milestone: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  textContainer: {
    marginLeft: 12,
  },
}) 