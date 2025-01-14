import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Surface } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Something went wrong',
  onRetry 
}) => {
  const { theme } = useAppTheme()

  return (
    <Surface style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text 
        variant="bodyLarge" 
        style={[styles.message, { color: theme.text.primary }]}
      >
        {message}
      </Text>
      {onRetry && (
        <Button 
          mode="contained" 
          onPress={onRetry}
          style={styles.button}
          buttonColor={theme.primary}
        >
          Retry
        </Button>
      )}
    </Surface>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    borderRadius: 20,
  },
}) 