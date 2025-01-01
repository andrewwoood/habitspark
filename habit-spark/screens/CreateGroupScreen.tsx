import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useGroupStore } from '../store/groupStore'
import type { NavigationProps } from '../types/navigation'

export const CreateGroupScreen = ({ navigation }: NavigationProps) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const createGroup = useGroupStore(state => state.createGroup)

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      setLoading(true)
      await createGroup(name.trim())
      navigation.goBack()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.header}>Create New Group</Text>
      <TextInput
        label="Group Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={!name.trim()}
        style={styles.button}
      >
        Create Group
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
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
}) 