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
      <Surface style={styles.mainCard}>
        <Text variant="displaySmall" style={styles.percentage}>
          {statistics.completionRate}%
        </Text>
        <Text variant="bodyMedium">Last 7 Days</Text>
        <Text variant="bodySmall">Completion Rate</Text>
      </Surface>

      <View style={styles.row}>
        <Surface style={[styles.card, styles.halfCard]}>
          <Text variant="headlineMedium" style={styles.number}>
            {statistics.thisWeekCompletions}
          </Text>
          <Text variant="bodyMedium">This Week</Text>
          <Text variant="bodySmall">Completions</Text>
        </Surface>

        <Surface style={[styles.card, styles.halfCard]}>
          <Text variant="headlineMedium" style={styles.number}>
            {statistics.totalCompletions}
          </Text>
          <Text variant="bodyMedium">Total</Text>
          <Text variant="bodySmall">Completions</Text>
        </Surface>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  mainCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  percentage: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: 4,
  },
}) 