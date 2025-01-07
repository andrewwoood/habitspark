interface InviteLink {
  groupId: string;
  inviteCode: string;
  fullUrl: string;
}

class InviteStore {
  async generateInviteLink(groupId: string): Promise<InviteLink> {
    // Generate unique code
    const inviteCode = generateUniqueCode();
    
    // Save to database
    await supabase
      .from('group_invites')
      .insert({
        group_id: groupId,
        invite_code: inviteCode,
        created_by: currentUser.id
      });

    // Return formatted link
    return {
      groupId,
      inviteCode,
      fullUrl: `https://habitspark.app/invite/${groupId}/${inviteCode}`
    };
  }
} 