import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Surface, List, Avatar, IconButton } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { useAppTheme } from '../theme/ThemeContext'
import { MemberSkeleton } from './MemberSkeleton'
import { haptics } from '../utils/haptics'

interface MemberProfile {
  display_name: string
  avatar_url: string
}

interface GroupMembersProps {
  members: string[]
  memberProfiles: Record<string, MemberProfile>
  isGroupCreator: boolean
  currentUserId?: string
  onKickMember: (memberId: string) => void
  kickingMemberId: string | null
  loadingProfiles: boolean
}

const MemberItem = React.memo(({ 
  memberId,
  profile,
  isGroupCreator,
  currentUserId,
  onKickMember,
  kickingMemberId,
}: {
  memberId: string
  profile: MemberProfile
  isGroupCreator: boolean
  currentUserId?: string
  onKickMember: (id: string) => void
  kickingMemberId: string | null
}) => {
  const { theme } = useAppTheme()

  return (
    <List.Item
      title={profile?.display_name || 'Anonymous User'}
      titleStyle={{ color: theme.text.primary }}
      left={() => (
        <Avatar.Image
          size={40}
          source={{ 
            uri: profile?.avatar_url || 
              `https://api.dicebear.com/7.x/bottts/svg?seed=${memberId}`
          }}
        />
      )}
      right={() => 
        isGroupCreator && memberId !== currentUserId ? (
          <IconButton 
            icon="account-remove"
            iconColor={theme.text.primary}
            onPress={() => {
              haptics.warning()
              onKickMember(memberId)
            }}
            disabled={kickingMemberId === memberId}
            loading={kickingMemberId === memberId}
          />
        ) : null
      }
      style={styles.memberItem}
    />
  )
})

export const GroupMembers: React.FC<GroupMembersProps> = ({
  members,
  memberProfiles,
  isGroupCreator,
  currentUserId,
  onKickMember,
  kickingMemberId,
  loadingProfiles,
}) => {
  const { theme } = useAppTheme()

  const renderItem = React.useCallback(({ item: memberId }: { item: string }) => (
    <MemberItem
      memberId={memberId}
      profile={memberProfiles[memberId]}
      isGroupCreator={isGroupCreator}
      currentUserId={currentUserId}
      onKickMember={onKickMember}
      kickingMemberId={kickingMemberId}
    />
  ), [memberProfiles, isGroupCreator, currentUserId, onKickMember, kickingMemberId])

  const keyExtractor = React.useCallback((memberId: string) => memberId, [])

  return (
    <Surface style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text 
        variant="titleMedium" 
        style={[styles.title, { color: theme.text.primary }]}
      >
        Members
      </Text>
      {loadingProfiles ? (
        <>
          <MemberSkeleton />
          <MemberSkeleton />
          <MemberSkeleton />
        </>
      ) : (
        <FlashList
          data={members}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={56}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Surface>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 200,
  },
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  memberItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
}) 