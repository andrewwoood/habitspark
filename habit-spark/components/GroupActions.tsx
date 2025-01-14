import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Button } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'
import { haptics } from '../utils/haptics'

interface GroupActionsProps {
  isGroupCreator: boolean
  onCopyInvite: () => void
  onLeave: () => void
  onDelete: () => void
  isCopying: boolean
  isLeaving: boolean
  isDeleting: boolean
}

export const GroupActions: React.FC<GroupActionsProps> = ({
  isGroupCreator,
  onCopyInvite,
  onLeave,
  onDelete,
  isCopying,
  isLeaving,
  isDeleting,
}) => {
  const { theme } = useAppTheme()
  const buttonScale = React.useRef(new Animated.Value(1)).current

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleCopyInvite = async () => {
    haptics.light()
    animateButton()
    onCopyInvite()
  }

  const handleLeave = () => {
    haptics.warning()
    animateButton()
    onLeave()
  }

  const handleDelete = () => {
    haptics.heavy()
    animateButton()
    onDelete()
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Button
          mode="contained"
          onPress={handleCopyInvite}
          style={[styles.button, styles.primaryButton]}
          loading={isCopying}
          disabled={isCopying}
          buttonColor={theme.primary}
        >
          {isCopying ? 'Copying...' : 'Copy Invite Link'}
        </Button>
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Button
          mode="contained"
          onPress={handleLeave}
          style={[styles.button, styles.dangerButton]}
          loading={isLeaving}
          disabled={isLeaving}
          buttonColor="#FF4444"
        >
          {isLeaving ? 'Leaving...' : 'Leave Group'}
        </Button>
      </Animated.View>

      {isGroupCreator && (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Button
            mode="contained"
            onPress={handleDelete}
            style={[styles.button, styles.dangerButton]}
            loading={isDeleting}
            disabled={isDeleting}
            buttonColor="#FF4444"
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </Button>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    marginBottom: 12,
    borderRadius: 100,
  },
  primaryButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dangerButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}) 