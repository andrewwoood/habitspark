export function InviteLinkHandler() {
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = async ({ url }: { url: string }) => {
    const { groupId, inviteCode } = parseInviteUrl(url);
    
    if (!user) {
      // Store invite data and redirect to auth
      await storeInviteData(groupId, inviteCode);
      navigation.navigate('Auth');
      return;
    }

    // Handle authenticated user
    await processInvite(groupId, inviteCode);
  };
} 