import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, List, FAB } from 'react-native-paper'

export const GroupScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>Your Groups</Text>
      <List.Section>
        <List.Item
          title="Join or create a group"
          left={props => <List.Icon {...props} icon="account-group" />}
        />
      </List.Section>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* TODO: Add group creation */}}
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