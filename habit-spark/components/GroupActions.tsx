import React from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { Button } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'

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
    animateButton()
    onCopyInvite()
  }

  const handleLeave = () => {
    animateButton()
    onLeave()
  }

  const handleDelete = () => {
    animateButton()
    onDelete()
  }

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <Button
          mode="outlined"
          onPress={handleCopyInvite}
          style={[styles.button, styles.primaryButton]}
          loading={isCopying}
          disabled={isCopying}
          textColor="#F4511E"
          buttonColor="white"
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="link" size={size} color={color} />
          )}
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
          buttonColor="#DC3545"
          icon={({ size }) => (
            <MaterialCommunityIcons name="exit-to-app" size={size} color="white" />
          )}
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
            buttonColor="#DC3545"
            icon={({ size }) => (
              <MaterialCommunityIcons name="delete" size={size} color="white" />
            )}
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
    borderColor: '#F4511E',
    borderWidth: 1,
  },
  dangerButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
}) 