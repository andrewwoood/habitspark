import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'

interface GroupHeaderProps {
  name: string
  code: string
  onBack: () => void
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  name,
  code,
  onBack,
}) => {
  const { theme } = useAppTheme()

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <IconButton
          icon="arrow-left"
          iconColor="#5D4037"
          onPress={onBack}
        />
        <Text 
          variant="titleLarge"
          style={[styles.title, { color: '#5D4037' }]}
        >
          {name}
        </Text>
      </View>
      <Text 
        variant="bodyMedium" 
        style={[styles.code, { color: '#8D6E63' }]}
      >
        Group Code: {code}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  code: {
    marginLeft: 52,
    opacity: 0.7,
  },
}) 