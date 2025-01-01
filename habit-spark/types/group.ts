export interface Group {
  id: string
  name: string
  code: string
  created_by: string
  created_at: string
  members: string[]
}

export interface GroupStats {
  memberCount: number
  completionRate: number
  totalCompletions: number
} 