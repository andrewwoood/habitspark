import * as React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../store/authStore'
import { HomeScreen } from '../screens/HomeScreen'
import { CreateHabitScreen } from '../screens/CreateHabitScreen'
import { GroupScreen } from '../screens/GroupScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { SignUpScreen } from '../screens/SignUpScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { CreateGroupScreen } from '../screens/CreateGroupScreen'
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// Auth stack for non-authenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
)

// Main tabs with our new design
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#FFF8E7',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#D2691E',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupScreen}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// Main stack for authenticated users
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen 
      name="CreateHabit" 
      component={CreateHabitScreen}
      options={{
        headerShown: true,
        headerTitle: 'Create Habit',
        headerStyle: {
          backgroundColor: '#FFF8E7',
        },
        headerTintColor: '#8B4513',
      }}
    />
  </Stack.Navigator>
)

export const Navigation = () => {
  const user = useAuthStore((state) => state.user)
  
  return (
    <>{user ? <MainStack /> : <AuthStack />}</>
  )
} 