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
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen'
import { MemberDetailsScreen } from '../screens/MemberDetailsScreen'
import { View, TouchableOpacity, Text } from 'react-native'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// Auth stack for non-authenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
)

// First, create a GroupStack for the Groups tab
const GroupStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GroupList" component={GroupScreen} />
    <Stack.Screen 
      name="GroupDetails" 
      component={GroupDetailsScreen}
    />
  </Stack.Navigator>
)

// Main tabs with our new design
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
        },
        tabBarButton: (props) => {
          const isActive = props.accessibilityState?.selected
          return (
            <View style={{ flex: 1, padding: 4 }}>
              <TouchableOpacity
                {...props}
                style={[
                  {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    paddingVertical: 8,
                  },
                  isActive && {
                    backgroundColor: '#FFE4B5',
                  }
                ]}
              >
                <View style={{ alignItems: 'center' }}>
                  {/* Stack the icon and text */}
                  {props.children}
                </View>
              </TouchableOpacity>
            </View>
          )
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name="home" size={size} color={color} />
            </View>
          ),
          tabBarLabelStyle: {
            transform: [{ translateY: 8 }],
          },
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupStack}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
          tabBarLabelStyle: {
            transform: [{ translateY: 8 }],
          },
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
          tabBarLabelStyle: {
            transform: [{ translateY: 8 }],
          },
        }}
      />
    </Tab.Navigator>
  )
}

// Main stack for authenticated users
const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
    <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    <Stack.Screen name="MemberDetails" component={MemberDetailsScreen} />
  </Stack.Navigator>
)

export const Navigation = () => {
  const user = useAuthStore((state) => state.user)
  
  return (
    <>{user ? <MainStack /> : <AuthStack />}</>
  )
} 