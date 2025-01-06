import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'

export interface Group {
  id: string
  name: string
  code: string
  created_by: string
  created_at: string
  members: string[]
}

interface GroupState {
  groups: Group[]
  loading: boolean
  error: string | null
  createGroup: (name: string) => Promise<void>
  joinGroup: (code: string) => Promise<void>
  fetchGroups: () => Promise<void>
  leaveGroup: (groupId: string) => Promise<void>
  groupStats: Record<string, { date: string; completion_rate: number; member_count: number }[]>
  fetchGroupStats: (groupId: string) => Promise<void>
  kickMember: (groupId: string, memberId: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  loading: false,
  error: null,
  createGroup: async (name: string) => {
    try {
      set({ loading: true, error: null })
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const userId = (await supabase.auth.getUser()).data.user?.id

      const { data: group, error } = await supabase
        .from('groups')
        .insert([{
          name,
          code,
          created_by: userId,
          members: [userId]
        }])
        .select()
        .single()

      if (error) throw error
      set(state => ({ groups: [...state.groups, group] }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  joinGroup: async (code: string) => {
    try {
      set({ loading: true, error: null })
      const userId = (await supabase.auth.getUser()).data.user?.id

      const { data: group, error: fetchError } = await supabase
        .from('groups')
        .select()
        .eq('code', code)
        .single()

      if (fetchError) throw fetchError
      if (!group) throw new Error('Group not found')

      const { error: updateError } = await supabase
        .from('groups')
        .update({ members: [...group.members, userId] })
        .eq('id', group.id)

      if (updateError) throw updateError
      set(state => ({ groups: [...state.groups, { ...group, members: [...group.members, userId] }] }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  fetchGroups: async () => {
    try {
      set({ loading: true, error: null })
      const userId = (await supabase.auth.getUser()).data.user?.id

      const { data: groups, error } = await supabase
        .from('groups')
        .select()
        .contains('members', [userId])

      if (error) throw error
      set({ groups: groups || [] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  leaveGroup: async (groupId: string) => {
    try {
      set({ loading: true, error: null })
      const userId = (await supabase.auth.getUser()).data.user?.id
      const group = get().groups.find(g => g.id === groupId)

      if (!group) throw new Error('Group not found')

      const { error } = await supabase
        .from('groups')
        .update({ members: group.members.filter(id => id !== userId) })
        .eq('id', groupId)

      if (error) throw error
      set(state => ({ groups: state.groups.filter(g => g.id !== groupId) }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  groupStats: {},
  fetchGroupStats: async (groupId: string) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await supabase
        .from('group_stats')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: false })

      if (error) throw error
      set(state => ({
        groupStats: {
          ...state.groupStats,
          [groupId]: data || []
        }
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  kickMember: async (groupId: string, memberId: string) => {
    try {
      set({ loading: true, error: null })
      const group = get().groups.find(g => g.id === groupId)
      if (!group) throw new Error('Group not found')

      const { error } = await supabase
        .from('groups')
        .update({ 
          members: group.members.filter(id => id !== memberId)
        })
        .eq('id', groupId)

      if (error) throw error
      
      // Update local state
      set(state => ({
        groups: state.groups.map(g =>
          g.id === groupId 
            ? { ...g, members: g.members.filter(id => id !== memberId) }
            : g
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },
  deleteGroup: async (groupId: string) => {
    try {
      set({ loading: true, error: null })
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error
      
      // Update local state
      set(state => ({
        groups: state.groups.filter(g => g.id !== groupId)
      }))
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  }
})) 