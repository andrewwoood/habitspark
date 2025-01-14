import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, SegmentedButtons } from 'react-native-paper'
import { useAppTheme } from '../theme/ThemeContext'
import { GroupHeatmap } from './GroupHeatmap'

interface GroupProgressProps {
  timeframe: string
  onTimeframeChange: (value: string) => void
  groupId: string
  completionData: Array<{
    date: string
    completion_rate: number
    member_count: number
  }>
}

export const GroupProgress: React.FC<GroupProgressProps> = ({
  timeframe,
  onTimeframeChange,
  groupId,
  completionData,
}) => {
  const { theme } = useAppTheme()

  const getTimeframeLabel = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3m':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6m':
        startDate.setMonth(now.getMonth() - 6)
        break
    }
    
    return `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - Present`
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text 
          variant="titleMedium" 
          style={[styles.title, { color: '#5D4037' }]}
        >
          Group Progress
        </Text>
        
        <SegmentedButtons
          value={timeframe}
          onValueChange={onTimeframeChange}
          buttons={[
            { value: '1m', label: '1M' },
            { value: '3m', label: '3M' },
            { value: '6m', label: '6M' },
          ]}
          style={styles.timeframeButtons}
          theme={{
            colors: {
              primary: '#F4511E',
              secondaryContainer: '#FFF8E1',
              onSecondaryContainer: '#5D4037',
            }
          }}
        />
      </View>
      
      <Text style={[styles.dateRange, { color: theme.text.secondary }]}>
        {getTimeframeLabel()}
      </Text>
      <GroupHeatmap 
        completionData={completionData}
        timeframe={timeframe}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  segmentedButtons: {
    height: 36,
    borderRadius: 20,
  },
  dateRange: {
    fontSize: 12,
    marginBottom: 12,
    opacity: 0.7,
  },
  timeframeButtons: {
    height: 36,
    borderRadius: 20,
    width: 'auto',
  },
}) 