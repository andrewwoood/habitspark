import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Surface, List, Avatar, IconButton, Card } from 'react-native-paper'
import { FlashList } from '@shopify/flash-list'
import { useAppTheme } from '../theme/ThemeContext'
import { MemberSkeleton } from './MemberSkeleton'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'

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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

const MemberItem = React.memo(({ 
  memberId,
  profile,
  isGroupCreator,
  currentUserId,
  onKickMember,
  kickingMemberId,
  onMemberPress
}: {
  memberId: string
  profile: MemberProfile
  isGroupCreator: boolean
  currentUserId?: string
  onKickMember: (id: string) => void
  kickingMemberId: string | null
  onMemberPress: (memberId: string) => void
}) => {
  const { theme } = useAppTheme()

  return (
    <TouchableOpacity onPress={() => onMemberPress(memberId)}>
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
                onKickMember(memberId)
              }}
              disabled={kickingMemberId === memberId}
              loading={kickingMemberId === memberId}
            />
          ) : null
        }
        style={styles.memberItem}
      />
    </TouchableOpacity>
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
  const navigation = useNavigation<NavigationProp>()
  const { theme } = useAppTheme()

  const [error, setError] = useState<string | null>(null)

  const handleMemberPress = (memberId: string) => {
    const profile = memberProfiles[memberId]
    navigation.navigate('MemberDetails', {
      memberId,
      displayName: profile?.display_name || 'Anonymous User',
      avatarUrl: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${memberId}`
    })
  }

  const renderItem = React.useCallback(({ item: memberId }: { item: string }) => (
    <MemberItem
      memberId={memberId}
      profile={memberProfiles[memberId]}
      isGroupCreator={isGroupCreator}
      currentUserId={currentUserId}
      onKickMember={onKickMember}
      kickingMemberId={kickingMemberId}
      onMemberPress={handleMemberPress}
    />
  ), [memberProfiles, isGroupCreator, currentUserId, onKickMember, kickingMemberId, handleMemberPress])

  const keyExtractor = React.useCallback((memberId: string) => memberId, [])

  if (error) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.surface }]}>
        <Text 
          variant="titleMedium" 
          style={[styles.title, { color: theme.text.primary }]}
        >
          Members
        </Text>
        <Text style={[styles.error, { color: theme.text.secondary }]}>
          {error}
        </Text>
      </Surface>
    )
  }

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
  error: {
    textAlign: 'center',
    marginVertical: 16,
  },
}) 