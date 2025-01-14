import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { useAppTheme } from '../theme/ThemeContext'

export const MemberSkeleton = () => {
  const { theme } = useAppTheme()
  const opacity = React.useRef(new Animated.Value(0.3)).current

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()

    return () => animation.stop()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.avatar,
          { 
            backgroundColor: theme.background,
            opacity 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.content,
          { 
            backgroundColor: theme.background,
            opacity 
          }
        ]} 
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  content: {
    height: 20,
    borderRadius: 4,
    flex: 1,
  },
}) 