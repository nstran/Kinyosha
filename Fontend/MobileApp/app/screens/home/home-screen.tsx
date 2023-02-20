import React, { useRef } from "react"
import { observer } from "mobx-react-lite"
import {
  StyleSheet,
  ViewStyle,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextStyle,
} from "react-native"
import { Header, Screen, Text } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import ActionSheet from "react-native-actionsheet"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

const layout = Dimensions.get("window")

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

export const HomeScreen = observer(function HomeScreen() {
  let actionSheet = useRef()
  let actionSheetDonHang = useRef()
  let actionSheetBaoGia = useRef()
  const navigation = useNavigation()

  const goToPage = (page) => {
    if (page) {
      if (page == "Tiềm năng") {
        showActionSheet()
      } else if (page == "Báo giá") {
        showActionSheetBaoGia()
      } else if (page == "Đơn hàng") {
        showActionSheetDonHang()
      } else {
        navigation.navigate(page)
      }
    }
  }

  const generateItem = (name: string, page = null, colors = ["#007ad9", "#007ad9", "#007ad9"]) => {
    return (
      <TouchableOpacity style={styles.item} onPress={() => goToPage(page)}>
        <LinearGradient colors={colors} style={styles.itemWrapper}>
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={24}
            color={color.palette.white}
          />
        </LinearGradient>
        <Text numberOfLines={1} style={styles.text}>
          {name}
        </Text>
      </TouchableOpacity>
    )
  }

  const topComponent = () => {
    return (
      <View style={{ padding: 16 }}>
        <View style={styles.layout}>
          <Text style={styles.itemTitle}>Nhân sự</Text>
          <View style={styles.gird}>
            {generateItem("Nghỉ phép", "ListDeXuatXinNghiScreen", [
              "#007ad9",
              "#007ad9",
              "#007ad9",
            ])}
          </View>
        </View>
        <View style={styles.layout}>
          <Text style={styles.itemTitle}>Quản trị khách hàng</Text>
          <View style={styles.gird}>
            {generateItem("Tiềm năng", "Tiềm năng")}
            {generateItem("Báo giá", "Báo giá")}
            {generateItem("Khách hàng")}
          </View>
        </View>
        <View style={styles.layout}>
          <Text style={styles.itemTitle}>Bán hàng</Text>
          <View style={styles.gird}>
            {generateItem("Đơn hàng", "Đơn hàng")}
            {generateItem("Hợp đồng")}
          </View>
        </View>
        <View style={styles.layout}>
          <Text style={styles.itemTitle}>Dự án</Text>
          <View style={styles.gird}>{generateItem("Dashboard")}</View>
        </View>
      </View>
    )
  }

  const showActionSheet = () => {
    // @ts-ignore
    actionSheet.current.show()
  }
  const showActionSheetBaoGia = () => {
    // @ts-ignore
    actionSheetBaoGia.current.show()
  }
  const showActionSheetDonHang = () => {
    // @ts-ignore
    actionSheetDonHang.current.show()
  }

  return (
    <>
      <Screen style={ROOT} preset="fixed">
        <View style={{ flex: 1 }}>
          <Header headerText="TIỆN ÍCH" style={HEADER} titleStyle={HEADER_TITLE}/>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: "#ECF0F4" }}
            ListHeaderComponent={topComponent()}
            renderItem={null}
            data={[]}
            keyExtractor={(item, index) => "dashboard-hone-" + index + String(item)}
          />
        </View>
        <ActionSheet
          ref={actionSheet}
          title={"Bạn muốn xem"}
          options={["Dashboard", "Danh sách", "Tạo mới", "Hủy"]}
          cancelButtonIndex={3}
          // destructiveButtonIndex={3}
          onPress={(index) => {
            if (index == 0) {
              goToPage("DashboardCustomerPotentialScreen")
            } else if (index == 1) {
              goToPage("ListKhachHangTienNangScreen")
            } else if (index == 2) {
              goToPage("StoreKhachHangTienNangScreen")
            }
          }}
        />

        <ActionSheet
          ref={actionSheetBaoGia}
          title={"Bạn muốn xem"}
          options={["Dashboard", "Danh sách", "Tạo mới", "Hủy"]}
          cancelButtonIndex={3}
          // destructiveButtonIndex={3}
          onPress={(index) => {
            if (index == 0) {
              goToPage("")
            } else if (index == 1) {
              goToPage("ListBaoGiaScreen")
            } else if (index == 2) {
              goToPage("TaoBaoGiaScreen")
            }
          }}
        />
        <ActionSheet
          ref={actionSheetDonHang}
          title={"Bạn muốn xem"}
          options={["Dashboard", "Danh sách", "Tạo mới", "Hủy"]}
          cancelButtonIndex={3}
          onPress={(index) => {
            if (index == 0) {
              // goToPage("DashboardDonHangScreen")
            } else if (index == 1) {
              goToPage("ListDonHangScreen")
            } else if (index == 2) {
              // goToPage("StoreDonHangScreen")
            }
          }}
        />
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  gird: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    marginTop: 8,
    borderColor: color.palette.lighterGrey,
  },
  item: {
    width: "33%",
    alignItems: "center",
    paddingTop: 16,
    justifyContent: "center",
    // backgroundColor: color.palette.black,
  },
  itemWrapper: {
    width: layout.width / 7,
    height: layout.width / 7,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    // backgroundColor: color.palette.white,
  },
  layout: {
    backgroundColor: "#F8F8FA",
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  itemTitle: {
    color: color.palette.black,
    fontWeight: "500",
  },
  button: {
    width: layout.width / 7,
    height: layout.width / 7,
    borderRadius: 21,
  },
  text: {
    color: color.palette.black,
    fontSize: 13,
    fontWeight: "500",
  },
})
