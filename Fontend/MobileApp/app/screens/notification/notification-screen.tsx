import React from "react"
import { observer } from "mobx-react-lite"
import { FlatList, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { Header, Screen, Text } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

const HEADER: TextStyle = {
  paddingBottom: spacing[4],
  paddingHorizontal: spacing[4],
  paddingTop: spacing[3],
}

const HEADER_TITLE: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
  letterSpacing: 1.5,
  lineHeight: 15,
  textAlign: "center",
  color: color.palette.black,
}

export const NotificationScreen = observer(function NotificationScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  const listEmptyComponent = () => {
    return <View style={styles.emptyNotificationWrapper}>
      <Text style={styles.emptyNotificationText}>Không có dữ liệu</Text>
    </View>
  }

  return (
    <Screen style={ROOT} preset="fixed">
      <Header
        headerText="THÔNG BÁO"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        style={HEADER}
        titleStyle={HEADER_TITLE}
      />
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
        data={[]}
        ListEmptyComponent={listEmptyComponent}
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  emptyNotificationWrapper: {
    flex: 1, justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyNotificationText: {
    color: color.palette.lightGrey,
  },
})
