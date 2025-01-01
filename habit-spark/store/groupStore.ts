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
  }
})) 