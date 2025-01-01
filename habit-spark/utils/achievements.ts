export interface Achievement {
  id: string
  title: string
  description: string
  requirement: number // days required
  icon: string // MaterialCommunityIcons name
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintained a 3-day streak',
    requirement: 3,
    icon: 'star-outline'
  },
  {
    id: 'streak_7',
    title: 'One Week Wonder',
    description: 'Maintained a 7-day streak',
    requirement: 7,
    icon: 'star-half-full'
  },
  {
    id: 'streak_14',
    title: 'Habit Former',
    description: 'Maintained a 14-day streak',
    requirement: 14,
    icon: 'star'
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintained a 30-day streak',
    requirement: 30,
    icon: 'star-circle'
  },
  {
    id: 'streak_69',
    title: 'Nice!',
    description: 'Maintained a 69-day streak',
    requirement: 69,
    icon: 'star-face'
  }
]

export const getUnlockedAchievements = (streak: number): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => streak >= achievement.requirement)
}

export const getNextAchievement = (streak: number): Achievement | null => {
  return ACHIEVEMENTS.find(achievement => streak < achievement.requirement) || null
} 