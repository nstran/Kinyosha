/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React, {createContext, useContext, useEffect, useState} from 'react';
import {Linking, useColorScheme} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  LoginScreen,
  DashboardScreen,
  PhaseDetailScreen,
  LotDetailScreen,
} from '../screens';
import {navigationRef} from './navigation-utilities';
import { PrimaryNavigator } from './primary-navigator';
// import AuthLoadingScreen from '../screens/auth/auth-loading-screen';
import { useStores } from '../models';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../config/firebase';


// import {PrimaryNavigator} from './primary-navigator';
// import {VerifyTokenScreen} from '../screens/auth/verify-token-screen';
// import {ResetPasswordScreen} from '../screens/auth/reset-password-screen';

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type NavigatorParamList = {
  primaryStack: undefined
  loading: undefined
  LoginScreen: undefined
  registerScreen: undefined
  DashboardScreen: undefined 
  LotDetailScreen:undefined
  HumanReortScreen:undefined
  PhaseDetailScreen: undefined
  WellcomeScreen:undefined   
  ChatScreen:undefined
  NotifyScreen: undefined
  NotifyDetailScreen: undefined
  ChatObo: undefined
  JobSearchScreen: undefined
  SettingScreen: undefined
  NewDetailScreen:undefined
  ForgotPWScreen: undefined
  NewPWScreen: undefined
}

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<NavigatorParamList>();

// const linking = {
//   prefixes: ['movesapp://', 'movesapp.com'],
//   config: {
//     screens:{
//       primaryStack: "apps/code",
//     },
//   },
// };

// const Drawer = createDrawerNavigator();
// const AuthenticatedUserContext = createContext({});

export const AppNavigator = (props: NavigationProps) => {
  // const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const workSifyModel = useStores()
  // useEffect(() => {
  //   // onAuthStateChanged returns an unsubscriber
  //   const unsubscribeAuth = onAuthStateChanged(
  //     auth,
  //     async authenticatedUser => {
  //       authenticatedUser ? setUser(authenticatedUser) : setUser(null);
  //       setIsLoading(false);
  //     }
  //   );
  //   return unsubscribeAuth;
  // }, [user]);
  return (
    <NavigationContainer
      // linking={linking}
      ref={navigationRef}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      {...props}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="LoginScreen"
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen}/>
        <Stack.Screen name="primaryStack" component={PrimaryNavigator}/>       
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />      
        <Stack.Screen name="PhaseDetailScreen" component={PhaseDetailScreen} />
        <Stack.Screen name="LotDetailScreen" component={LotDetailScreen} />        
      </Stack.Navigator>
    </NavigationContainer>
  );
};
//options={{gestureEnabled: false, headerLeft: () => null}}

AppNavigator.displayName = 'AppNavigator';

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ['welcome'];
export const canExit = (routeName: string) => exitRoutes.includes(routeName);
