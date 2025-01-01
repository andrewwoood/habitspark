import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, List, FAB } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'

export const HomeScreen = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>Today's Habits</Text>
      <List.Section>
        <List.Item
          title="Add your first habit"
          left={props => <List.Icon {...props} icon="plus" />}
        />
      </List.Section>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* TODO: Add habit creation */}}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}) 