import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuthStore } from '../store/authStore'
import {
  LoginScreen,
  SignUpScreen,
  HomeScreen,
  GroupScreen,
  ProfileScreen,
  CreateHabitScreen,
  CreateGroupScreen,
  GroupDetailsScreen
} from '../screens'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Import your screens here
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
)

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Groups" component={GroupScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

const MainStack = createNativeStackNavigator()

const MainStackScreen = () => (
  <MainStack.Navigator>
    <MainStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
    <MainStack.Screen name="CreateHabit" component={CreateHabitScreen} />
    <MainStack.Screen name="CreateGroup" component={CreateGroupScreen} />
    <MainStack.Screen name="GroupDetails" component={GroupDetailsScreen} />
  </MainStack.Navigator>
)

export const Navigation = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <NavigationContainer>
      {user ? <MainStackScreen /> : <AuthStack />}
    </NavigationContainer>
  )
} 