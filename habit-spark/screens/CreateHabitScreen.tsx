import * as React from 'react'
import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { useHabitsStore } from '../store/habitsStore'
import type { NavigationProps } from '../types/navigation'

export const CreateHabitScreen = ({ navigation }: NavigationProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [loading, setLoading] = useState(false)
  const { addHabit, fetchHabits } = useHabitsStore()

  const handleCreateHabit = async () => {
    try {
      setLoading(true)
      await addHabit({
        name,
        description,
        frequency,
      })
      await fetchHabits()
      navigation.goBack()
    } catch (error: any) {
      console.error('Create habit error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Create New Habit</Text>
      <TextInput
        label="Habit Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button 
        mode="contained"
        onPress={handleCreateHabit}
        loading={loading}
        disabled={!name || !frequency}
        style={styles.button}
      >
        Create Habit
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
  },
}) 