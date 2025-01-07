import { supabase } from '../api/supabaseClient';

// Generate a new invite link for a group
export const generateInviteLink = async (groupId: string): Promise<string> => {
  console.log('1. Starting with groupId:', groupId, 'type:', typeof groupId);

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  console.log('2. Generated inviteCode:', inviteCode);

  // Get user first
  const { data: { user } } = await supabase.auth.getUser();
  console.log('3. Got user:', user?.id);

  // Insert into database
  const { error } = await supabase
    .from('group_invites')
    .insert({
      group_id: groupId,
      invite_code: inviteCode,
      created_by: user?.id,
      active: true
    });

  if (error) {
    console.error('4. Database error:', error);
    throw error;
  }

  console.log('5. Database insert successful');

  // Just return the string directly
  const url = `https://habitspark.app/invite/${groupId}/${inviteCode}`;
  console.log('6. Created URL:', url);
  
  return url;
};

// Join a group using an invite code
export const joinGroupWithInvite = async (groupId: string, inviteCode: string) => {
  // First check if invite is valid
  const { data: invite, error: inviteError } = await supabase
    .from('group_invites')
    .select()
    .eq('group_id', groupId)
    .eq('invite_code', inviteCode)
    .eq('active', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invite');
  }

  // Add user to group
  const { error: joinError } = await supabase
    .from('groups')
    .update({
      members: supabase.sql`array_append(members, ${supabase.auth.getUser()?.id})`
    })
    .eq('id', groupId);

  if (joinError) {
    throw new Error('Failed to join group');
  }
}; 