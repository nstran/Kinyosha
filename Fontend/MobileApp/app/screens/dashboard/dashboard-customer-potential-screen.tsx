import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  Alert,
  Dimensions,
  Text,
  FlatList,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
} from "react-native"
import { Header, Loading, Screen } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import {
  // LineChart,
  // BarChart,
  PieChart,
  // ProgressChart,
  // ContributionGraph,
  // StackedBarChart
} from "react-native-chart-kit"

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

const layout = Dimensions.get("window")

const _unitOfWork = new UnitOfWorkService()

export const DashboardCustomerPotentialScreen = observer(function DashboardCustomerPotentialScreen() {
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const [data, setData] = useState<any>(null)
  const navigation = useNavigation()

  useEffect(() => {
    fetchData()
  }, [isRefresh])
  const fetchData = async () => {
    setRefresh(false)
    if (!isRefresh) {
      setLoading(true)
      let response: any = await _unitOfWork.user.getDataDashboardPotentialCustomer({})
      setLoading(false)
      if (response.data?.statusCode == 200) {
        if (response.data?.listInvestmentFundDasboard?.length) {
          response.data?.listInvestmentFundDasboard.map(item => {
            item.name = item?.categoryName
            item.population = item?.percentValue
            switch (item?.categoryName) {
              case "Website":
                item.color = "rgb(255, 99, 132)"
                break
              case "Khách hàng giới thiệu":
                item.color = "rgb(255, 205, 86)"
                break
              case "Nội bộ":
                item.color = "rgb(221, 72, 149)"
                break
              case "Facebook":
                item.color = "rgb(54, 162, 235)"
                break
              case "Không xác định":
                item.color = "rgb(139, 235, 122)"
                break
              default:
              // code block
            }
            return item
          })
        }
        setData(response.data)
      } else {
        goBack(response.data?.messageCode)
      }
    }
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

  const compare = (a, b) => {
    if (a.value < b.value) {
      return 1
    }
    if (a.value > b.value) {
      return -1
    }
    return 0
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const topComponent = () => {
    return (
      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: color.palette.white, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontWeight: "500", marginTop: 16, textAlign: "center" }}>
            Số lượng tiềm năng theo nguồn gốc
          </Text>
          <PieChart
            data={data?.listInvestmentFundDasboard?.length ? data?.listInvestmentFundDasboard : []}
            width={layout.width - 32}
            height={256}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={"population"}
            center={[(layout.width - 16) / 4, 0]}
            hasLegend={false}
          />
          <View style={styles.chartInforWrapper}>
            {data?.listInvestmentFundDasboard?.length ?
              data?.listInvestmentFundDasboard.map((item, index) => (
                <View
                  key={item.toString() + index}
                  style={styles.chartInfoItem}>
                  <View style={[styles.chartInfoColor, { backgroundColor: item.color }]}/>
                  <Text style={[styles.chartInfoText, { color: item.color }]}>
                    {`${item?.name} (${(item?.population * 100).toFixed(2)}%)`}
                  </Text>
                </View>
              ))
              : null}
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Danh sách tiềm năng mới nhất</Text>
            <TouchableOpacity>
              <Text style={styles.cardHeaderTextRight}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {data?.topNewestCustomer?.length ?
            data?.topNewestCustomer.map((item, index) => {
              return (
                <View key={"dashboard-topNewestCustomer-" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Họ và Tên</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.customerName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.customerPhone ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Số điện thoại</Text>
                        <Text style={[styles.cardBodyItemTextRight,
                          { color: color.palette.black }]}>{item?.customerPhone}</Text>
                      </View>
                      : null}
                    {item?.customerEmail ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Email</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.customerEmail} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.picName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Người phụ trách</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.picName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                  </View>
                </View>
              )
            })
            : null}
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Danh sách tiềm năng mới nhất đã chuyển đổi</Text>
            <TouchableOpacity>
              <Text style={styles.cardHeaderTextRight}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {data?.topNewestCustomerConverted?.length ?
            data?.topNewestCustomerConverted.map((item, index) => {
              return (
                <View key={"dashboard-topNewestCustomerConverted-" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Họ và Tên</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.customerName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.customerPhone ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Số điện thoại</Text>
                        <Text style={[styles.cardBodyItemTextRight,
                          { color: color.palette.black }]}>{item?.customerPhone}</Text>
                      </View>
                      : null}
                    {item?.customerEmail ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Email</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.customerEmail} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.picName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Người phụ trách</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.picName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                  </View>
                </View>
              )
            })
            : null}
        </View>
      </View>
    )
  }

  return (
    <>
      {isLoading && <Loading/>}
      <Screen style={ROOT} preset="fixed">
        <View style={{ flex: 1 }}>
          <Header
            headerText="KHÁCH HÀNG TIỀM NĂNG"
            style={HEADER}
            titleStyle={HEADER_TITLE}
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: "#ECF0F4" }}
            refreshing={isRefresh}
            onRefresh={() => onRefresh()}
            ListHeaderComponent={topComponent()}
            renderItem={null}
            data={[]}
            keyExtractor={(item, index) => "potential-customer-dashboard-" + index + String(item)}
          />
        </View>
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  chartInforWrapper: {
    paddingBottom: 16,
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
  },
  chartInfoItem: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chartInfoColor: {
    height: 10, width: 10, borderRadius: 10 / 2,
  },
  chartInfoText: {
    fontSize: 14, paddingLeft: 10,
  },
  cardWrapper: {
    backgroundColor: color.palette.white, borderRadius: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexWrap: "wrap",
  },
  cardHeaderTextLeft: {
    color: color.palette.black, fontWeight: "bold", fontSize: 14,
  },
  cardHeaderTextRight: {
    color: color.palette.primary, fontSize: 13,
  },
  cardBody: {
    borderTopWidth: 1, borderColor: "#ccc",
  },
  cardBodyWrapper: {
    paddingHorizontal: 16, paddingBottom: 16,
  },
  cardBodyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  cardBodyItemTextLeft: {
    color: color.palette.black,
    fontWeight: "500",
    fontSize: 13,
  },
  cardBodyItemTextRight: {
    color: color.palette.primary, fontSize: 13,
  },
  doanhThuWrapper: {
    paddingHorizontal: 16, paddingBottom: 16,
  },
  chiTieuText: {
    color: color.palette.black, fontSize: 13, marginBottom: 6,
  },
  totalSalesCenterWrapper: {
    justifyContent: "center", alignItems: "center", marginBottom: 13,
  },
  totalSalesCenterText: {
    color: color.palette.primary, fontSize: 24, fontWeight: "500",
  },
  doanhThuPressWrapper: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    // flexWrap: "wrap",
  },
  doanhThuPressText: {
    color: color.palette.black, fontSize: 13,
  },
  rowCenter: {
    flexDirection: "row", alignItems: "center",
  },
})
