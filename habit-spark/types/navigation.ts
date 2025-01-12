import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Login: undefined
  SignUp: undefined
  Home: undefined
  Groups: undefined
  Profile: undefined
  CreateHabit: undefined
  GroupDetails: { groupId: string }
  MainTabs: undefined
}

export type NavigationProps<T extends keyof RootStackParamList = never> = NativeStackScreenProps<
  RootStackParamList,
  T
> 