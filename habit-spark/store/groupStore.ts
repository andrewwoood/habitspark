import { create } from 'zustand'
import { supabase } from '../api/supabaseClient'
import { generateInviteLink } from '../store/inviteStore'

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
  updateGroupStats: (groupId: string, date: string) => Promise<void>
  generateInviteLink: (groupId: string) => Promise<string>
  joinGroupByInvite: (groupId: string, inviteCode: string) => Promise<void>
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
      const formattedCode = code.trim().toUpperCase()
      
      // First create the RPC function in Supabase:
      // Create this SQL function in Supabase:
      /*
      create or replace function join_group(group_code text, user_id uuid)
      returns json language plpgsql security definer as $$
      declare
        target_group groups;
        updated_group groups;
      begin
        -- Get the group
        select * into target_group from groups where code = group_code;
        
        if target_group is null then
          raise exception 'Group not found';
        end if;
        
        -- Check if already a member
        if user_id = any(target_group.members) then
          raise exception 'Already a member';
        end if;
        
        -- Update the group
        update groups 
        set members = array_append(members, user_id)
        where id = target_group.id
        returning * into updated_group;
        
        return row_to_json(updated_group);
      end;
      $$;
      
      grant execute on function join_group(text, uuid) to authenticated;
      */

      // Then use it in the code:
      const { data: updatedGroup, error } = await supabase
        .rpc('join_group', {
          group_code: formattedCode,
          user_id: userId
        })

      if (error) throw error
      if (!updatedGroup) throw new Error('Failed to join group')

      // Update local state
      set(state => ({
        groups: [...state.groups, updatedGroup]
      }))
    } catch (error: any) {
      console.error('Join group error:', error)
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

      const { error } = await supabase
        .rpc('leave_group', {
          group_id: groupId,
          user_id: userId
        })

      if (error) throw error

      // Update local state
      set(state => ({ 
        groups: state.groups.filter(g => g.id !== groupId)
      }))
    } catch (error: any) {
      console.error('Leave group error:', error)
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
  },
  updateGroupStats: async (groupId: string, date: string) => {
    try {
      const { error } = await supabase
        .rpc('update_group_stats', {
          p_group_id: groupId,
          target_date: date
        })

      if (error) throw error

      // Refresh stats after update
      await get().fetchGroupStats(groupId)
    } catch (error: any) {
      console.error('Error updating group stats:', error)
    }
  },
  generateInviteLink: async (groupId: string) => {
    try {
      set({ loading: true, error: null });
      const { fullUrl } = await generateInviteLink(groupId);
      return fullUrl;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  joinGroupByInvite: async (groupId: string, inviteCode: string) => {
    try {
      set({ loading: true, error: null });
      await validateAndJoinGroup(groupId, inviteCode);
      
      // Refresh groups list after joining
      await get().fetchGroups();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
})) 