import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import type { HabitStatistics } from '../utils/statisticsCalculator'

interface StatisticsViewProps {
  statistics: HabitStatistics
}

export const StatisticsView = ({ statistics }: StatisticsViewProps) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Text variant="titleMedium">Last 30 Days</Text>
        <Text variant="displaySmall" style={styles.number}>
          {Math.round(statistics.completionRate)}%
        </Text>
        <Text variant="bodyMedium">Completion Rate</Text>
      </Surface>
      <View style={styles.row}>
        <Surface style={[styles.card, styles.halfCard]}>
          <Text variant="titleMedium">This Week</Text>
          <Text variant="headlineMedium" style={styles.number}>
            {statistics.thisWeekCompletions}
          </Text>
          <Text variant="bodyMedium">Completions</Text>
        </Surface>
        <Surface style={[styles.card, styles.halfCard]}>
          <Text variant="titleMedium">Total</Text>
          <Text variant="headlineMedium" style={styles.number}>
            {statistics.totalCompletions}
          </Text>
          <Text variant="bodyMedium">Completions</Text>
        </Surface>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  halfCard: {
    flex: 0.48,
  },
  number: {
    marginVertical: 4,
  },
}) 