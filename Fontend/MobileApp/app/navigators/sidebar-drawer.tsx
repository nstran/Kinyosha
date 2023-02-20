import React, {} from "react"
import { DrawerContentScrollView } from "@react-navigation/drawer"
import {
  View,
} from "react-native"


export function SidebarDrawer(props) {

  // useEffect(() => {
  //   async function fetchData() {
  //   }
  //
  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   fetchData()
  // }, [])
  // const fetchData = async () => {
  // }

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: "#3D4852" }}>
      {/*@ts-ignore*/}
      <View>

      </View>
    </DrawerContentScrollView>
  )
}
