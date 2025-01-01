import * as React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar, Text, ActivityIndicator, HelperText } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../api/supabaseClient'

interface AvatarUploadProps {
  size?: number
  onUpload?: (url: string) => void
  currentUrl?: string | null
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['jpg', 'jpeg', 'png']

export const AvatarUpload = ({ size = 100, onUpload, currentUrl }: AvatarUploadProps) => {
  const [uploading, setUploading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(currentUrl)
  const [error, setError] = React.useState<string | null>(null)

  const validateImage = async (uri: string): Promise<boolean> => {
    try {
      // Check file type
      const fileExt = uri.split('.').pop()?.toLowerCase()
      if (!fileExt || !ALLOWED_FILE_TYPES.includes(fileExt)) {
        setError('Please select a JPG or PNG image')
        return false
      }
      
      // Check file size
      const response = await fetch(uri)
      const blob = await response.blob()
      if (blob.size > MAX_FILE_SIZE) {
        setError('Image size must be less than 2MB')
        return false
      }
      
      return true
    } catch (error) {
      setError('Error validating image')
      return false
    }
  }

  const pickImage = async () => {
    try {
      setError(null)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        maxWidth: 500,
        maxHeight: 500
      })

      if (!result.canceled) {
        const isValid = await validateImage(result.assets[0].uri)
        if (!isValid) return
        
        setUploading(true)
        await uploadAvatar(result.assets[0].uri)
      }
    } catch (error) {
      setError('Error selecting image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const uploadAvatar = async (uri: string) => {
    try {
      setError(null)
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('No user found')

      const fileExt = uri.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const response = await fetch(uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setAvatarUrl(data.publicUrl)
      onUpload?.(data.publicUrl)
    } catch (error: any) {
      setError('Error uploading image. Please try again.')
    }
  }

  return (
    <TouchableOpacity onPress={pickImage} disabled={uploading}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={size}
            source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/default-avatar.jpg')}
          />
          {uploading && (
            <View style={[styles.overlay, { width: size, height: size }]}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : (
          <Text style={styles.uploadText}>
            {uploading ? 'Uploading...' : 'Tap to change avatar'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
}) 