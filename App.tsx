import * as React from 'react'
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { AuthProvider } from './habit-spark/contexts/AuthProvider'
import { Navigation } from './habit-spark/navigation/Navigation'
import { PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
        <Toast config={{
          success: (props) => <>{props.customComponent}</>
        }} />
      </AuthProvider>
    </PaperProvider>
  )
} 