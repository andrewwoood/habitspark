import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Avatar } from 'react-native-paper'
import { useAuthStore } from '../store/authStore'

export const ProfileScreen = () => {
  const { user, signOut } = useAuthStore((state) => ({
    user: state.user,
    signOut: state.signOut,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={64} label={user?.email?.[0].toUpperCase() || 'U'} />
        <Text variant="titleLarge" style={styles.email}>{user?.email}</Text>
      </View>
      <Button mode="contained" onPress={signOut} style={styles.button}>
        Sign Out
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 32,
  },
  email: {
    marginTop: 16,
  },
  button: {
    marginTop: 16,
  },
}) 