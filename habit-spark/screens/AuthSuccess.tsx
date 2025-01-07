import React, { useEffect } from 'react';
import { View } from 'react-native';
import { getStoredInviteData, processInvite, clearStoredInviteData } from '../store/inviteStore';

export function AuthSuccess() {
  useEffect(() => {
    const processStoredInvite = async () => {
      const storedInvite = await getStoredInviteData();
      if (storedInvite) {
        await processInvite(storedInvite.groupId, storedInvite.inviteCode);
        await clearStoredInviteData();
      }
    };

    processStoredInvite();
  }, []);

  return <View />;
} 