import 'react-native-url-polyfill'
import 'react-native-reanimated'
import 'react-native-gesture-handler'
import React from 'react'
import { AuthProvider } from './habit-spark/contexts/AuthProvider'
import { Navigation } from './habit-spark/navigation/Navigation'
import { PaperProvider } from 'react-native-paper'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { View, Text, Platform } from 'react-native'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong!</Text>
          <Text>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider>
        <AuthProvider>
          <Navigation />
          <StatusBar style="auto" />
          <Toast config={{
            success: (props) => <>{props.customComponent}</>
          }} />
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  )
} 