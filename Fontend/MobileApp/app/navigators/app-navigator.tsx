/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import React from "react"
import { useColorScheme } from "react-native"
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  WelcomeScreen,
  DemoScreen,
  DemoListScreen,
  LoginScreen,
  ForgotPasswordScreen,
  HomeScreen,
  ProfileScreen,
  ChangePasswordScreen,
  NotificationScreen,
  ListDeXuatXinNghiScreen,
  TaoDeXuatXinNghiScreen,
  DashboardHomeScreen,
  DashboardCustomerPotentialScreen,
  ListKhachHangTienNangScreen,
  StoreKhachHangTienNangScreen,
  ListBaoGiaScreen,
  TaoBaoGiaScreen,
  DonHangScreen,
  ListDonHangScreen,
  StoreDonHangScreen,
  DashboardDonHangScreen,
} from "../screens"
import { navigationRef, useBackButtonHandler } from "./navigation-utilities"
import { PrimaryNavigator } from "./primary-navigator"

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
  welcome: undefined
  demo: undefined
  demoList: undefined

  LoginScreen: undefined
  ForgotPasswordScreen: undefined
  HomeScreen: undefined
  ProfileScreen: undefined
  PrimaryStack: undefined
  ChangePasswordScreen: undefined
  NotificationScreen: undefined
  ListDeXuatXinNghiScreen: undefined
  TaoDeXuatXinNghiScreen: undefined
  DashboardHomeScreen: undefined
  DashboardCustomerPotentialScreen: undefined
  ListKhachHangTienNangScreen: undefined
  StoreKhachHangTienNangScreen: undefined
  ListBaoGiaScreen:undefined
  TaoBaoGiaScreen:undefined
  DonHangScreen:undefined
  ListDonHangScreen:undefined
  StoreDonHangScreen:undefined
  DashboardDonHangScreen:undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<NavigatorParamList>()

const AppStack = () => {
  return (
    // @ts-ignore
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="LoginScreen"
    >
      <Stack.Screen name="welcome" component={WelcomeScreen}/>
      <Stack.Screen name="demo" component={DemoScreen}/>
      <Stack.Screen name="demoList" component={DemoListScreen}/>

      <Stack.Screen name="PrimaryStack" component={PrimaryNavigator}/>
      <Stack.Screen name="LoginScreen" component={LoginScreen}/>
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>
      <Stack.Screen name="HomeScreen" component={HomeScreen}/>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen}/>
      <Stack.Screen name="NotificationScreen" component={NotificationScreen}/>
      <Stack.Screen name="ListDeXuatXinNghiScreen" component={ListDeXuatXinNghiScreen}/>
      <Stack.Screen name="TaoDeXuatXinNghiScreen" component={TaoDeXuatXinNghiScreen}/>
      <Stack.Screen name="DashboardHomeScreen" component={DashboardHomeScreen}/>
      <Stack.Screen name="DashboardCustomerPotentialScreen" component={DashboardCustomerPotentialScreen}/>
      <Stack.Screen name="ListKhachHangTienNangScreen" component={ListKhachHangTienNangScreen}/>
      <Stack.Screen name="StoreKhachHangTienNangScreen" component={StoreKhachHangTienNangScreen}/>
      <Stack.Screen name="ListBaoGiaScreen" component={ListBaoGiaScreen}/>
      <Stack.Screen name="TaoBaoGiaScreen" component={TaoBaoGiaScreen}/>
      <Stack.Screen name="DonHangScreen" component={DonHangScreen}/>
      <Stack.Screen name="ListDonHangScreen" component={ListDonHangScreen}/>
      <Stack.Screen name="StoreDonHangScreen" component={StoreDonHangScreen}/>
      <Stack.Screen name="DashboardDonHangScreen" component={DashboardDonHangScreen}/>
    </Stack.Navigator>
  )
}

interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> {
}

export const AppNavigator = (props: NavigationProps) => {
  const colorScheme = useColorScheme()
  useBackButtonHandler(canExit)
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack/>
    </NavigationContainer>
  )
}

AppNavigator.displayName = "AppNavigator"

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
