import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  Login: undefined
  SignUp: undefined
  Home: undefined
  Groups: undefined
  Profile: undefined
}

export type NavigationProps = NativeStackScreenProps<RootStackParamList> 