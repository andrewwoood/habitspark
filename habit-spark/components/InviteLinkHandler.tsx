import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { storeInviteData, processInvite } from '../store/inviteStore';

interface ParsedInvite {
  groupId: string;
  inviteCode: string;
}

const parseInviteUrl = (url: string): ParsedInvite => {
  const parts = url.split('/');
  return {
    groupId: parts[parts.length - 2],
    inviteCode: parts[parts.length - 1],
  };
};

export function InviteLinkHandler() {
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }: { url: string }) => {
    const { groupId, inviteCode } = parseInviteUrl(url);
    
    if (!user) {
      await storeInviteData(groupId, inviteCode);
      navigation.navigate('Auth');
      return;
    }

    await processInvite(groupId, inviteCode);
  };

  return null;
} 