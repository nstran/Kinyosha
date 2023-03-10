import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle, View, FlatList, Alert, TouchableOpacity, StyleSheet } from "react-native"
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

export const ListDeXuatXinNghiScreen = observer(function ListDeXuatXinNghiScreen() {
  const [isRefresh, setRefresh] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [listData, setListData] = useState([])
  const isFocused = useIsFocused()
  const [fullData, setFullData] = useState([])
  const [query, setQuery] = useState("")
  const navigation = useNavigation()

  const { tnmStore } = useStores()
  const { userInfo } = tnmStore

  useEffect(() => {
    fetchData()
  }, [isRefresh, isFocused])
  const fetchData = async () => {
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)
      setQuery("")
      let response: any = await _unitOfWork.user.getOrganizationByEmployeeId({
        employeeId: userInfo.employeeId,
      })
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        setLoading(false)
        goBack(response.data?.messageCode)
        return
      }
      let organizationId = response.data?.organization?.organizationId
      response = await _unitOfWork.user.getDataSearchEmployeeRequest({})
      if (response.data?.statusCode != 200) {
        setLoading(false)
        goBack(response.data?.messageCode)
        return
      }
      // setListStatus(response.data?.listStatus)
      // setListTypeRequest(response.data?.listTypeRequest)
      response = await _unitOfWork.user.employeeRequestSearch({
        "EmployeeRequestCode": "",
        "OfferEmployeeCode": "",
        "OfferEmployeeName": "",
        "OfferOrganizationId": organizationId,
        "ListTypeRequestId": [],
        "ListStatusId": [],
        "StartDate": null,
        "EndDate": null,
        "UserId": "e69ff20c-c9bb-ec11-80d4-005056995cb4",
      })
      setLoading(false)
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        goBack(response.data?.messageCode)
        return
      }
      setListData(response.data?.employeeRequestList)
      setFullData(response.data?.employeeRequestList)
    }
  }

  const goBack = (err = "C?? l???i x???y ra, vui l??ng th??? l???i", boolean = false) => {
    Alert.alert("Th??ng b??o", err,
      [{
        text: "OK", onPress: () => {
          if (boolean) {
            navigation && navigation.goBack()
          }
        },
      }], { cancelable: false })
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const ItemView = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.card,
        item?.statusName == "Nh??p" ? { borderColor: "rgb(174, 164, 160)" } :
          item?.statusName == "???? ph?? duy???t" ? { borderColor: "rgb(0, 122, 255)" } :
            item?.statusName == "??ang ch??? ph?? duy???t" ? { borderColor: "rgb(255, 204, 0)" } : {},
      ]} onPress={() => navigation.navigate('TaoDeXuatXinNghiScreen', {
        id: item?.employeeRequestId
      })}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderCode}>{item?.employeeRequestCode}</Text>
          <Text style={[styles.cardHeaderStatus,
            item?.statusName == "Nh??p" ? { color: "rgb(174, 164, 160)" } :
              item?.statusName == "???? ph?? duy???t" ? { color: "rgb(0, 122, 255)" } :
                item?.statusName == "??ang ch??? ph?? duy???t" ? { color: "rgb(255, 204, 0)" } : {},
          ]}>{item?.statusName}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>T??n NV ???????c ????? xu???t: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.offerEmployeeName}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>????n v???: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.organization}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>T??? ng??y: </Text>
          <Text style={styles.cardBodyTextRight}>{_unitOfWork.formatDate(item?.startDate)}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>?????n ng??y: </Text>
          <Text style={styles.cardBodyTextRight}>{_unitOfWork.formatDate(item?.enDate)}</Text>
        </View>
        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Lo???i ????? xu???t: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.typeRequestName}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const emptyComponent = () => {
    return <View style={styles.emptyNotificationWrapper}>
      <Text style={styles.emptyNotificationText}>Kh??ng c?? d??? li???u</Text>
    </View>
  }

  const footerComponent = () => {
    return (
      <View style={{ marginBottom: 16 }}/>
    )
  }

  const contains = (item, query) => {
    return (item?.statusName ? item?.statusName.toLowerCase().includes(query) : false)
      || (item?.employeeRequestCode ? item?.employeeRequestCode.toLowerCase().includes(query) : false)
      || (item?.offerEmployeeName ? item?.offerEmployeeName.toLowerCase().includes(query) : false)
      || (item?.organization ? item?.organization.toLowerCase().includes(query) : false)
      || (item?.typeRequestName ? item?.typeRequestName.toLowerCase().includes(query) : false)
      || (item?.startDate ? _unitOfWork.formatDate(item?.startDate).toLowerCase().includes(query) : false)
      || (item?.enDate ? _unitOfWork.formatDate(item?.enDate).toLowerCase().includes(query) : false)
  }

  const findData = (query) => {
    const data = filter(fullData, item => {
      return (query != "" ? contains(item, query.toLowerCase()) : true)
    })
    setListData(data)
  }

  return (
    <>
      {isLoading && <Loading/>}
      <Screen style={ROOT} preset="fixed">
        <Header
          rightIcon={faPlus}
          headerText="????? XU???T XIN NGH???"
          leftIcon="back"
          onRightPress={() => navigation.navigate('TaoDeXuatXinNghiScreen')}
          onLeftPress={() => navigation.goBack()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
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
              clearButtonMode='always' placeholder='T??m ki???m'
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
    borderBottomWidth: 1, paddingBottom: 8,
    borderColor: color.palette.lighterGrey,
    marginBottom: 2,
  },
  cardHeaderCode: {
    color: color.palette.black, fontSize: 14, fontWeight: "500",
  },
  cardHeaderStatus: {
    fontSize: 13,
  },
  cardBodyWrapper: {
    flexDirection: "row", flexWrap: "wrap", marginTop: 6, justifyContent: "space-between",
  },
  cardBodyTextLeft: {
    color: color.palette.black, fontSize: 13, fontWeight: "500",
  },
  cardBodyTextRight: {
    color: color.palette.black, fontSize: 13,
  },
})
