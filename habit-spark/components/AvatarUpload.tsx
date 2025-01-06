import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Avatar, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { TouchableOpacity } from 'react-native'

interface AvatarUploadProps {
  size: number
  onUpload: (url: string) => Promise<void>
  currentUrl: string | null
}

export const AvatarUpload = ({ size, onUpload, currentUrl }: AvatarUploadProps) => {
  console.log('Current avatar URL:', currentUrl) // Debug log

  const handlePress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })

      if (!result.canceled && result.assets[0].uri) {
        await onUpload(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      {currentUrl ? (
        <Avatar.Image 
          size={size} 
          source={{ uri: currentUrl }}
          style={styles.avatar}
        />
      ) : (
        <Avatar.Icon 
          size={size} 
          icon="account"
          style={styles.avatar}
        />
      )}
      <Text style={styles.text}>Tap to change avatar</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E8DEF8',
  },
  text: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
}) 