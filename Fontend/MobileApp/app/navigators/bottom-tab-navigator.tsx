import * as React from "react"
import { DashboardHomeScreen, HomeScreen, NotificationScreen, ProfileScreen } from "../screens"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StyleSheet } from "react-native"
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
// import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"

// const getTabBarIcon = (name) => ({ color, size }: { color: string; size: number }) => (
//   <FontAwesomeIcon icon={name} color={color} size={size}/>
// )

const BottomTabs = createBottomTabNavigator()

export default function BottomTabsScreen(props) {

  return (
    <>
      {/*@ts-ignore*/}
      <BottomTabs.Navigator
        initialRouteName="DashboardHomeScreen"
        // screenOptions={{
        //   tabBarActiveTintColor: '#e91e63',
        // }}
      >
        <BottomTabs.Screen
          key={`DashboardHomeScreen`}
          name={`DashboardHomeScreen`}
          component={DashboardHomeScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <AntDesign name="home" color={color} size={size}/>
            ),
            // tabBarBadge: 3,
          }}
        />
        <BottomTabs.Screen
          key={`HomeScreen`}
          name={`HomeScreen`}
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size}/>
            ),
            // tabBarBadge: 3,
          }}
        />
        <BottomTabs.Screen
          key={`NotificationScreen`}
          name={`NotificationScreen`}
          component={NotificationScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <Ionicons name="notifications-outline" color={color} size={size}/>
            ),
            // tabBarBadge: 1,
          }}
        />
        <BottomTabs.Screen
          key={`ProfileScreen`}
          name={`ProfileScreen`}
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <AntDesign name="bars" color={color} size={size}/>
            ),
          }}
        />
      </BottomTabs.Navigator>
    </>
  )
}

// @ts-ignore
const styles = StyleSheet.create({})
