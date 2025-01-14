import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, IconButton } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'

interface GroupHeaderProps {
  name: string
  code: string
  onBack: () => void
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ 
  name, 
  code, 
  onBack 
}) => {
  const { theme } = useAppTheme()

  return (
    <Surface style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={onBack}
          iconColor={theme.text.primary}
        />
        <Text 
          variant="headlineSmall" 
          style={[styles.title, { color: theme.text.primary }]}
        >
          {name}
        </Text>
      </View>
      <View style={styles.codeContainer}>
        <Text 
          variant="bodyMedium" 
          style={[styles.codeLabel, { color: theme.text.secondary }]}
        >
          Group Code:
        </Text>
        <Text 
          variant="bodyMedium" 
          style={[styles.code, { backgroundColor: theme.background }]}
        >
          {code}
        </Text>
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    opacity: 0.7,
  },
  code: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
}) 