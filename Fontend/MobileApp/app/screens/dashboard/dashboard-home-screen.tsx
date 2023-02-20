import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, FlatList, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Header, Loading, Screen, Text } from "../../components"
import { color, spacing } from "../../theme"
import { useNavigation } from "@react-navigation/native"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { EvilIcons } from "@expo/vector-icons"

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

export const DashboardHomeScreen = observer(function DashboardHomeScreen() {
  const [isRefresh, setRefresh] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const navigation = useNavigation()

  useEffect(() => {
    fetchData()
  }, [isRefresh])
  const fetchData = async () => {
    setRefresh(false)
    if (!isRefresh) {
      setLoading(true)
      let response: any = await _unitOfWork.user.getDataDashboardHome({})
      setLoading(false)
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        goBack(response.data?.messageCode)
        return
      }
      setData(response.data)
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

  const onRefresh = () => {
    setRefresh(true)
  }

  const topComponent = () => {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Doanh thu trong tuần</Text>
          </View>
          <View style={styles.doanhThuWrapper}>
            <View style={styles.totalSalesCenterWrapper}>
              <Text style={styles.totalSalesCenterText}>
                {_unitOfWork.formatNumber(data?.totalSalesOfWeek, true)}
              </Text>
            </View>
            <Text style={styles.chiTieuText}>
              Chỉ tiêu của tuần: {_unitOfWork.formatNumber(data?.chiTieuDoanhThuTuan, true)}
            </Text>
            <View style={styles.doanhThuPressWrapper}>
              <Text style={styles.doanhThuPressText}>
                Tuần trước: {_unitOfWork.formatNumber(data?.totalSalesOfWeekPress, true)}
              </Text>
              <View style={styles.rowCenter}>
                {
                  data?.totalSalesOfWeek > data?.totalSalesOfWeekPress ?
                    <EvilIcons name="chevron-up" size={24} color={color.palette.successAccent}/> :
                    <EvilIcons name="chevron-down" size={24} color={color.palette.criticalAccent}/>
                }
                <Text style={{
                  color: data?.totalSalesOfWeek > data?.totalSalesOfWeekPress ?
                    color.palette.successAccent :
                    color.palette.criticalAccent, fontSize: 13,
                }}>
                  {_unitOfWork.formatNumber(Math.abs(data?.totalSalesOfWeek - data?.totalSalesOfWeekPress), true)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Doanh thu trong tháng</Text>
          </View>
          <View style={styles.doanhThuWrapper}>
            <View style={styles.totalSalesCenterWrapper}>
              <Text style={styles.totalSalesCenterText}>
                {_unitOfWork.formatNumber(data?.totalSalesOfMonth, true)}
              </Text>
            </View>
            <Text style={styles.chiTieuText}>
              Chỉ tiêu của tháng: {_unitOfWork.formatNumber(data?.chiTieuDoanhThuThang, true)}
            </Text>
            <View style={styles.doanhThuPressWrapper}>
              <Text style={styles.doanhThuPressText}>
                Tháng trước: {_unitOfWork.formatNumber(data?.totalSalesOfMonthPress, true)}
              </Text>
              <View style={styles.rowCenter}>
                {
                  data?.totalSalesOfMonth > data?.totalSalesOfMonthPress ?
                    <EvilIcons name="chevron-up" size={24} color={color.palette.successAccent}/> :
                    <EvilIcons name="chevron-down" size={24} color={color.palette.criticalAccent}/>
                }
                <Text style={{
                  color: data?.totalSalesOfMonth > data?.totalSalesOfMonthPress ?
                    color.palette.successAccent :
                    color.palette.criticalAccent, fontSize: 13,
                }}>
                  {_unitOfWork.formatNumber(Math.abs(data?.totalSalesOfMonth - data?.totalSalesOfMonthPress), true)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Doanh thu trong quý</Text>
          </View>
          <View style={styles.doanhThuWrapper}>
            <View style={styles.totalSalesCenterWrapper}>
              <Text style={styles.totalSalesCenterText}>
                {_unitOfWork.formatNumber(data?.totalSalesOfQuarter, true)}
              </Text>
            </View>
            <Text style={styles.chiTieuText}>
              Chỉ tiêu của quý: {_unitOfWork.formatNumber(data?.chiTieuDoanhThuQuy, true)}
            </Text>
            <View style={styles.doanhThuPressWrapper}>
              <Text style={styles.doanhThuPressText}>
                Quý trước: {_unitOfWork.formatNumber(data?.totalSalesOfQuarterPress, true)}
              </Text>
              <View style={styles.rowCenter}>
                {
                  data?.totalSalesOfQuarter > data?.totalSalesOfQuarterPress ?
                    <EvilIcons name="chevron-up" size={24} color={color.palette.successAccent}/> :
                    <EvilIcons name="chevron-down" size={24} color={color.palette.criticalAccent}/>
                }
                <Text style={{
                  color: data?.totalSalesOfQuarter > data?.totalSalesOfQuarterPress ?
                    color.palette.successAccent :
                    color.palette.criticalAccent, fontSize: 13,
                }}>
                  {_unitOfWork.formatNumber(Math.abs(data?.totalSalesOfQuarter - data?.totalSalesOfQuarterPress), true)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Doanh thu trong năm</Text>
          </View>
          <View style={styles.doanhThuWrapper}>
            <View style={styles.totalSalesCenterWrapper}>
              <Text style={styles.totalSalesCenterText}>
                {_unitOfWork.formatNumber(data?.totalSalesOfYear, true)}
              </Text>
            </View>
            <Text style={styles.chiTieuText}>
              Chỉ tiêu của năm: {_unitOfWork.formatNumber(data?.chiTieuDoanhThuName, true)}
            </Text>
            <View style={styles.doanhThuPressWrapper}>
              <Text style={styles.doanhThuPressText}>
                Năm trước: {_unitOfWork.formatNumber(data?.totalSalesOfYearPress, true)}
              </Text>
              <View style={styles.rowCenter}>
                {
                  data?.totalSalesOfYear > data?.totalSalesOfYearPress ?
                    <EvilIcons name="chevron-up" size={24} color={color.palette.successAccent}/> :
                    <EvilIcons name="chevron-down" size={24} color={color.palette.criticalAccent}/>
                }
                <Text style={{
                  color: data?.totalSalesOfQuarter > data?.totalSalesOfYearPress ?
                    color.palette.successAccent :
                    color.palette.criticalAccent, fontSize: 13,
                }}>
                  {_unitOfWork.formatNumber(Math.abs(data?.totalSalesOfYear - data?.totalSalesOfYearPress), true)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTextLeft}>Báo giá mới</Text>
            <TouchableOpacity>
              <Text style={styles.cardHeaderTextRight}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {data?.listQuote?.length ?
            data?.listQuote.map((item, index) => {
              return (
                <View key={"dashboard-hone-baogiamoi" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.quoteCode ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Mã báo giá</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.quoteCode} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.totalAmount ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Trị giá báo giá</Text>
                        <Text style={[styles.cardBodyItemTextRight,
                          { color: color.palette.black }]}>{_unitOfWork.formatNumber(item?.totalAmount)}</Text>
                      </View>
                      : null}
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Khách hàng</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.customerName} </Text>
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
            <Text style={styles.cardHeaderTextLeft}>Khách hàng mới</Text>
            <TouchableOpacity>
              <Text style={styles.cardHeaderTextRight}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {data?.listCustomer?.length ?
            data?.listCustomer.map((item, index) => {
              return (
                <View key={"dashboard-hone-khachhangmoi" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Tên khách hàng</Text>
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
                          <Text style={[styles.cardBodyItemTextRight,
                            { color: color.palette.black }]}> {item?.customerEmail} </Text>
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
            <Text style={styles.cardHeaderTextLeft}>Đơn hàng mới</Text>
            <TouchableOpacity>
              <Text style={styles.cardHeaderTextRight}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {data?.listOrderNew?.length ?
            data?.listOrderNew.map((item, index) => {
              return (
                <View key={"dashboard-hone-donhangmoi" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.orderCode ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Mã đơn hàng</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.orderCode} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.amount ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Trị giá đơn hàng</Text>
                        <Text style={[styles.cardBodyItemTextRight,
                          { color: color.palette.black }]}>{_unitOfWork.formatNumber(item?.amount)}</Text>
                      </View>
                      : null}
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Khách hàng</Text>
                        <TouchableOpacity>
                          <Text style={[styles.cardBodyItemTextRight]}> {item?.customerName} </Text>
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
            <Text style={styles.cardHeaderTextLeft}>Sinh nhật khách hàng trong tuần</Text>
          </View>
          {data?.listCusBirthdayOfWeek?.length ?
            data?.listCusBirthdayOfWeek.map((item, index) => {
              return (
                <View key={"dashboard-hone-donhangmoi" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.customerName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Tên khách hàng</Text>
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
                          <Text style={[styles.cardBodyItemTextRight,
                            { color: color.palette.black }]}> {item?.customerEmail} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.dateOfBirth ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Sinh nhật</Text>
                        <TouchableOpacity>
                          <Text style={[styles.cardBodyItemTextRight,
                            { color: color.palette.black }]}> {_unitOfWork.formatDate(item?.dateOfBirth)} </Text>
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
            <Text style={styles.cardHeaderTextLeft}>Sinh nhật nhân viên trong tuần</Text>
          </View>
          {data?.listEmployeeBirthDayOfWeek?.length ?
            data?.listEmployeeBirthDayOfWeek.map((item, index) => {
              return (
                <View key={"dashboard-hone-donhangmoi" + item.toString() + index} style={styles.cardBody}>
                  <View style={styles.cardBodyWrapper}>
                    {item?.employeeName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Tên nhân viên</Text>
                        <TouchableOpacity>
                          <Text style={styles.cardBodyItemTextRight}> {item?.employeeName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.organizationName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Phòng ban</Text>
                        <Text style={[styles.cardBodyItemTextRight,
                          { color: color.palette.black }]}>{item?.organizationName}</Text>
                      </View>
                      : null}
                    {item?.positionName ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Chức vụ</Text>
                        <TouchableOpacity>
                          <Text style={[styles.cardBodyItemTextRight,
                            { color: color.palette.black }]}> {item?.positionName} </Text>
                        </TouchableOpacity>
                      </View>
                      : null}
                    {item?.dateOfBirth ?
                      <View style={styles.cardBodyItem}>
                        <Text style={styles.cardBodyItemTextLeft}>Sinh nhật</Text>
                        <TouchableOpacity>
                          <Text style={[styles.cardBodyItemTextRight,
                            { color: color.palette.black }]}> {_unitOfWork.formatDate(item?.dateOfBirth)} </Text>
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
            headerText="TRANG CHỦ"
            style={HEADER}
            titleStyle={HEADER_TITLE}
          />
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: "#ECF0F4" }}
            refreshing={isRefresh}
            onRefresh={() => onRefresh()}
            ListHeaderComponent={topComponent()}
            // ListFooterComponent={footerComponent()}
            // ListEmptyComponent={emptyComponent()}
            renderItem={null}
            data={[]}
            keyExtractor={(item, index) => "dashboard-hone-" + index + String(item)}
          />
        </View>
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: color.palette.white, borderRadius: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
