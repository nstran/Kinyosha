import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  TextStyle,
  ViewStyle,
  View,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { Header, Loading, Screen, Text } from "../../components"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { color, spacing } from "../../theme"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { useStores } from "../../models"
import { Input } from "@ui-kitten/components"
import filter from "lodash.filter"
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons"

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

const _unitOfWork = new UnitOfWorkService()

export const ListBaoGiaScreen = observer(function ListBaoGiaScreen() {
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [listData, setListData] = useState([])
  const [fullData, setFullData] = useState([])
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [isRefresh, isFocused])
  const fetchData = async () => {
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)
      setQuery("")
      let response: any = await _unitOfWork.user.searchQuote({
        EndDate: "",
        IsCompleteInWeek: false,
        IsCustomer: false,
        IsOutOfDate: false,
        IsPotentialCustomer: false,
        ListEmpCreateId: [],
        ListStatusQuote: [],
        QuoteCode: "",
        QuoteName: "",
        StartDate: null,
      })
      setLoading(false)
      console.log(response.data)
      if (response.data?.statusCode == 200) {
        setListData(response.data?.listQuote)
        setFullData(response.data?.listQuote)
      } else {
        goBack(response.data?.messageCode)
      }
    }
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const goBack = (err = "Có lỗi xảy ra, vui lòng thử lại", boolean = false) => {
    Alert.alert(
      "Thông báo",
      err,
      [
        {
          text: "OK",
          onPress: () => {
            if (boolean) {
              navigation && navigation.goBack()
            }
          },
        },
      ],
      { cancelable: false },
    )
  }

  const contains = (item, query) => {
    return (
      (item?.quoteCode ? item?.quoteCode.toLowerCase().includes(query) : false) ||
      (item?.quoteName ? item?.quoteName.toLowerCase().includes(query) : false) ||
      (item?.customerName ? item?.customerName.toLowerCase().includes(query) : false)
    )
  }

  const findData = (query) => {
    const data = filter(fullData, (item) => {
      return query != "" ? contains(item, query.toLowerCase()) : true
    })
    setListData(data)
  }

  const emptyComponent = () => {
    return (
      <View style={styles.emptyNotificationWrapper}>
        <Text style={styles.emptyNotificationText}>Không có dữ liệu</Text>
      </View>
    )
  }

  const footerComponent = () => {
    return <View style={{ marginBottom: 16 }} />
  }

  const ItemView = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { borderColor: item?.backgroundColorForStatus }]}
        // onPress={() => navigation.navigate("ChiTietKhachHangTiemNangScreen", {
        //   id: item?.customerId,
        // })}
      >
        <View style={styles.cardHeader}>
          {/* <Text style={styles.cardHeaderCode}>{item?.customerName}</Text> */}
          {/*<Text style={[styles.cardHeaderStatus,*/}
          {/*  item?.statusName == "Nháp" ? { color: "rgb(174, 164, 160)" } :*/}
          {/*    item?.statusName == "Đã phê duyệt" ? { color: "rgb(0, 122, 255)" } :*/}
          {/*      item?.statusName == "Đang chờ phê duyệt" ? { color: "rgb(255, 204, 0)" } : {},*/}
          {/*]}>{item?.customerName}</Text>*/}
        </View>
        {/*<View style={styles.cardBodyWrapper}>*/}
        {/*  <Text style={styles.cardBodyTextLeft}>Tên: </Text>*/}
        {/*  <Text style={styles.cardBodyTextRight}>{item?.customerName}</Text>*/}
        {/*</View>*/}
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Mã Báo giá: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.quoteCode}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Tên báo giá: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.quoteName}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Đối tượng: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.customerName}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Ngày báo giá: </Text>
          <Text style={styles.cardBodyTextRight}>{_unitOfWork.formatDate(item?.createdDate)}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Ngày dự liến: </Text>
          <Text style={styles.cardBodyTextRight}>
            {_unitOfWork.formatDate(item?.intendedQuoteDate)}
          </Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Trạng thái: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.quoteStatusName}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Tổng giá trị: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.totalAmount}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <>
      {isLoading && <Loading />}
      <Screen style={ROOT} preset="fixed">
        <Header
          rightIcon={faPlus}
          onRightPress={() => navigation.navigate("StoreKhachHangTienNangScreen")}
          headerText="Danh sách báo giá"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.searchWrapper}>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              value={query}
              onChangeText={(searchString) => {
                findData(searchString)
                setQuery(searchString)
              }}
              status="info"
              placeholderTextColor={color.palette.lightGrey}
              clearButtonMode="always"
              placeholder="Tìm kiếm"
              style={styles.searchInput}
              textStyle={styles.searchText}
            />
          </View>
          <FlatList
            contentContainerStyle={{ flexGrow: 1 }}
            // showsVerticalScrollIndicator={false}
            // showsHorizontalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: color.palette.white }}
            refreshing={isRefresh}
            onRefresh={() => onRefresh()}
            // ListHeaderComponent={topComponent()}
            ListFooterComponent={footerComponent()}
            ListEmptyComponent={emptyComponent()}
            renderItem={ItemView}
            data={listData}
            keyExtractor={(item, index) => "list-de-xuat-xin-nghi-" + index + String(item)}
          />
        </View>
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  emptyNotificationWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyNotificationText: {
    color: color.palette.lightGrey,
  },
  searchWrapper: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  searchInput: {
    borderRadius: 8,
    borderColor: "#F9F8FD",
    backgroundColor: "#F9F8FD",
  },
  searchText: {
    color: "#000",
    fontSize: 14,
  },
  card: {
    backgroundColor: color.palette.white,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 8,
    borderColor: color.palette.lighterGrey,
    marginBottom: 2,
  },
  cardHeaderCode: {
    color: color.palette.black,
    fontSize: 14,
    fontWeight: "500",
  },
  cardHeaderStatus: {
    fontSize: 13,
  },
  cardBodyWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    justifyContent: "space-between",
  },
  cardBodyTextLeft: {
    color: color.palette.black,
    fontSize: 13,
    fontWeight: "500",
  },
  cardBodyTextRight: {
    color: color.palette.black,
    fontSize: 13,
  },
})
