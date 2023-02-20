import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle, View, FlatList, Alert, TouchableOpacity, StyleSheet } from "react-native"
import { Header, Loading, Screen, Text } from "../../components"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { color, spacing } from "../../theme"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { Input } from "@ui-kitten/components"
import filter from "lodash.filter"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

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

export const ListDonHangScreen = observer(function ListDonHangScreen() {
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
      let response: any = await _unitOfWork.user.searchOrder({
        "OrderCode": "",
        "CustomerName": "",
        "ListStatusId": [],
        "Phone": "",
        "FromDate": null,
        "ToDate": null,
        "ProductId": null,
        "QuoteId": null,
        "ContractId": null,
        "Vat": 1,
        "ListEmployeeId": [],
        "ListCustomerId": [],
      })
      setLoading(false)
      // console.log(response.data)
      if (response.data?.statusCode == 200) {
        setListData(response.data?.listOrder)
        setFullData(response.data?.listOrder)
      } else {
        goBack(response.data?.messageCode)
      }
    }
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const goBack = (err = "Có lỗi xảy ra, vui lòng thử lại", boolean = false) => {
    Alert.alert("Thông báo", err,
      [{
        text: "OK", onPress: () => {
          if (boolean) {
            navigation && navigation.goBack()
          }
        },
      }], { cancelable: false })
  }

  const contains = (item, query) => {
    return (item?.orderStatusName ? item?.orderStatusName.toLowerCase().includes(query) : false)
      || (item?.orderCode ? item?.orderCode.toLowerCase().includes(query) : false)
      || (item?.customerName ? item?.customerName.toLowerCase().includes(query) : false)
      || (item?.amount ? item?.amount?.toString()?.toLowerCase().includes(query) : false)
      || (item?.sellerName ? item?.sellerName.toLowerCase().includes(query) : false)
      || (item?.listOrderDetail ? item?.listOrderDetail.toLowerCase().includes(query) : false)
      || (item?.orderDate ? _unitOfWork.formatDate(item?.orderDate).toLowerCase().includes(query) : false)
  }

  const findData = (query) => {
    const data = filter(fullData, item => {
      return (query != "" ? contains(item, query.toLowerCase()) : true)
    })
    setListData(data)
  }


  const emptyComponent = () => {
    return <View style={styles.emptyNotificationWrapper}>
      <Text style={styles.emptyNotificationText}>Không có dữ liệu</Text>
    </View>
  }

  const footerComponent = () => {
    return (
      <View style={{ marginBottom: 16 }}/>
    )
  }

  const getColorStatus = (expression) => {
    let color = "black"
    switch (expression) {
      case "RTN"://bi tra lai
        color = "#BB0000"
        break
      case "COMP"://da dong
        color = "#6D98E7"
        break
      case "DLV"://da giao hang
        color = "#66CC00"
        break
      case "PD"://da thanh toan
        color = "#9C00FF"
        break
      case "IP"://dang xu ly
        color = "#34c759"
        break
      case "ON"://hoan
        color = "#666666"
        break
      case "DS"://đang sấy
        color = "#3A7AFE"
        break
      case "DSX"://đã sấy xong
        color = "#C20505"
        break
      case "DNK"://đã nhập kho
        color = "#04B636"
        break
      default:
        color = "#ffcc00"
        break
    }
    return color
  }

  const ItemView = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.card,
        { borderColor: getColorStatus(item?.statusCode) },
      ]} onPress={() => {
        // navigation.navigate("StoreDonHangScreen", {
        //   id: item?.orderId,
        // })
      }}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderCode}>{item?.orderCode}</Text>
          <Text style={[styles.cardHeaderStatus,
            { color: getColorStatus(item?.statusCode) },
          ]}>{item?.orderStatusName}</Text>
        </View>
        {item?.customerName ?
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Khách hàng: </Text>
            <Text style={styles.cardBodyTextRight}>{item?.customerName}</Text>
          </View>
          : null}
        {item?.orderDate ?
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Ngày đặt hàng: </Text>
            <Text style={styles.cardBodyTextRight}>{_unitOfWork.formatDate(item?.orderDate)}</Text>
          </View>
          : null}
        {item?.amount != null ?
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng giá trị: </Text>
            <Text style={styles.cardBodyTextRight}>{_unitOfWork.formatNumber(item?.amount)}</Text>
          </View>
          : null}
        {item?.sellerName ?
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Nhân viên bán hàng: </Text>
            <Text style={styles.cardBodyTextRight}>{item?.sellerName}</Text>
          </View>
          : null}
        {item?.listOrderDetail ?
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Chi tiết: </Text>
            <Text style={styles.cardBodyTextRight}>{item?.listOrderDetail}</Text>
          </View>
          : null}
      </TouchableOpacity>
    )
  }

  const getTotal = () => {
    let count = 0
    if (listData?.length) {
      listData.map(item => {
        count += item?.amount
      })
    }
    return _unitOfWork.formatNumber(count)
  }

  const topComponent = () => {
    return (
      <View style={{ paddingHorizontal: 16, marginVertical: 4 }}>
        <Text style={{ color: color.palette.black, fontSize: 14 }}>Tổng giá trị: {getTotal()}</Text>
      </View>
    )
  }

  return (
    <>
      {isLoading && <Loading/>}
      <Screen style={ROOT} preset="fixed">
        <Header
          headerText="​DANH SÁCH ĐƠN HÀNG"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
          rightIcon={faPlus}
          onRightPress={() => navigation.navigate('StoreDonHangScreen')}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.searchWrapper}>
            <Input
              autoCapitalize='none' autoCorrect={false}
              value={query}
              onChangeText={(searchString) => {
                findData(searchString)
                setQuery(searchString)
              }}
              status='info'
              placeholderTextColor={color.palette.lightGrey}
              clearButtonMode='always' placeholder='Tìm kiếm'
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
    flex: 1, justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  emptyNotificationText: {
    color: color.palette.lightGrey,
  },
  searchWrapper: {
    backgroundColor: "#fff", paddingHorizontal: 16,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  searchInput: {
    borderRadius: 8, borderColor: "#F9F8FD", backgroundColor: "#F9F8FD",
  },
  searchText: {
    color: "#000", fontSize: 14,
  },
  card: {
    backgroundColor: color.palette.white, marginVertical: 8, marginHorizontal: 16,
    padding: 16, borderRadius: 8, borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 12,
    borderColor: color.palette.lighterGrey,
    marginBottom: 4,
  },
  cardHeaderCode: {
    color: color.palette.primary, fontSize: 14, fontWeight: "500",
  },
  cardHeaderStatus: {
    fontSize: 14,
  },
  cardBodyWrapper: {
    flexDirection: "row", flexWrap: "wrap", marginTop: 8, justifyContent: "space-between",
  },
  cardBodyTextLeft: {
    color: color.palette.black, fontSize: 14, fontWeight: "500",
  },
  cardBodyTextRight: {
    color: color.palette.black, fontSize: 14,
  },
})
