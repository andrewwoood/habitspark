import * as React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface AvatarUploadProps {
  size: number
  onUpload: (url: string) => Promise<void>
  currentUrl: string | null
}

export const AvatarUpload = ({ size, onUpload, currentUrl }: AvatarUploadProps) => {
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
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <Avatar.Image 
        size={size} 
        source={{ uri: currentUrl }}
        style={styles.avatar}
      />
      <View style={styles.cameraIconContainer}>
        <MaterialCommunityIcons 
          name="camera" 
          size={24} 
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#FFD700',
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFB74D',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
}) 