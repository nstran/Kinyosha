import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  Dimensions,
  StyleSheet,
  TextStyle,
  ViewStyle,
  View,
  FlatList,
  Alert,
  Text,
  TouchableOpacity, ScrollView,
} from "react-native"
import { Header, Loading, Screen } from "../../components"
import { color, spacing } from "../../theme"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { Entypo } from "@expo/vector-icons"
import { Input, Select, SelectItem } from "@ui-kitten/components"

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

export const StoreDonHangScreen = observer(function StoreDonHangScreen() {
  const [isShow, setShow] = useState({
    chiTietSanPham: true,
    thongTinMeSay: true,
    thongTinKhachHang: true,
    thongTinDonHang: true,
    tongHopDonHang: true,
  })
  const [isRefresh, setRefresh] = useState(false)
  const [order, setOrder] = useState({
    vat: "0",
    chietKhau: "0",
  })
  const [isLoading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [listCustomerMapIndex, setListCustomerMapIndex] = useState<any>([])
  const [listProductMapId, setListProductMapId] = useState<any>([])
  const [listProductMapDonVi, setListProductMapDonVi] = useState<any>([])
  const [listDonViTinhMapId, setListDonViTinhMapId] = useState<any>([])
  const [listChatLuongGoMapId, setListChatLuongGoMapId] = useState<any>([])
  const [listEmployeeMapId, setListEmployeeMapId] = useState<any>([])
  const isFocused = useIsFocused()
  const navigation = useNavigation()
  const router: any = useRoute()
  const params = router.params
  const [selectedIndex, setSelectedIndex] = useState({
    khachHang: null,
    thanhToan: null,
  })
  const [thongtinKhachHang, setThongtinKhachHang] = useState({
    tenKhachHang: "",
    diaChi: "",
    maSoThue: "",
    dienThoai: "",
    nguoiNhanHang: "",
    soNgayDuocNo: "",
    soNoToiDa: "",
  })

  useEffect(() => {
    fetchData()
  }, [isFocused, isRefresh])
  const fetchData = async () => {
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)
      let response: any = await _unitOfWork.user.getMasterDataOrderCreate({})
      setLoading(false)
      console.log(response.data)
      if (response.data?.statusCode == 200) {
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
            // navigation && navigation.goBack()
          }
        },
      }], { cancelable: false })
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const changeIsShow = (type) => {
    let _isShow = { ...isShow }
    _isShow[type] = !_isShow[type]
    setShow(_isShow)
  }

  const getTongTienTruocThue = () => {
    let count = 0
    if (data?.listCustomerOrderDetail?.length) {
      data?.listCustomerOrderDetail.map(item => {
        count += (item?.quantity * item?.unitPrice)
      })
    }
    return count
  }

  const changeThongTinKhacHang = (type, value) => {
    let _obj = { ...thongtinKhachHang }
    _obj[type] = value
    setThongtinKhachHang(_obj)
  }

  const displayMaKhachHang = () => {
    if (selectedIndex && selectedIndex?.khachHang) {
      return data?.listCustomer[selectedIndex?.khachHang?.row]?.customerCodeName
    }
    return ""
  }

  const displayPhuongThucThanhToan = () => {
    if (selectedIndex && selectedIndex?.thanhToan) {
      return data?.listPaymentMethod[selectedIndex?.thanhToan?.row]?.categoryName
    }
    return ""
  }

  const topComponent = () => {
    let tongTienTruocThue = getTongTienTruocThue()
    let tongTienThueGTGT = tongTienTruocThue * parseFloat(order?.vat) / 100
    let tongTienChietKhau = 0
    if (selectedIndex?.row == 0) {
      tongTienChietKhau = (tongTienTruocThue + tongTienThueGTGT) * parseFloat(order?.chietKhau) / 100
    } else {
      tongTienChietKhau = parseFloat(order?.chietKhau)
    }
    let tongSoTienPhaiThu = tongTienTruocThue + tongTienThueGTGT - tongTienChietKhau

    return (
      <View>

        <View style={styles.cardWrapper}>
          <TouchableOpacity
            style={styles.rowSpaceBetween}
            onPress={() => changeIsShow("tongHopDonHang")}>
            <Text style={styles.headerText}>
              Tổng hợp đơn hàng
            </Text>
            {
              isShow.tongHopDonHang ?
                <Entypo name="chevron-down" size={20} color="black"/> :
                <Entypo name="chevron-right" size={20} color="black"/>
            }
          </TouchableOpacity>
          {isShow.tongHopDonHang ?
            <View style={styles.headerTopWrapper}>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng tiền hàng trước thuế</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng chi phí</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng thuế VAT</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <Select
                value={selectedIndex?.row == 0 ? "Theo %" : "Số tiền"}
                style={{ marginBottom: 8 }}
                label={() => {
                  return (
                    <Text style={styles.inputLabel}>Chiết khấu theo tổng đơn hàng</Text>
                  )
                }}
                selectedIndex={selectedIndex}
                onSelect={index => setSelectedIndex(index)}>
                <SelectItem title='Theo %'/>
                <SelectItem title='Số tiền'/>
              </Select>
              <Input style={{ marginBottom: 16 }}
                     textStyle={{ color: color.palette.lightGrey }}
                     onChangeText={(searchString) => {
                       let _order = { ...order }
                       _order.chietKhau = searchString
                       setOrder(_order)
                     }}
                     value={_unitOfWork.formatNumber(order?.chietKhau)}
                     keyboardType={"numeric"}
              />
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng tiền chiết khấu (VND)</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienChietKhau)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng số tiền phải thu</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongSoTienPhaiThu)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Tổng giá vốn</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(0)
                }</Text>
              </View>
              <View style={[styles.rowTextWrapper]}>
                <Text style={styles.rowTextLeft}>Lợi nhuận tạm tính</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongSoTienPhaiThu)
                }</Text>
              </View>
              <View style={[styles.rowTextWrapper, { marginBottom: 0 }]}>
                <Text style={styles.rowTextLeft}>% lợi nhuận tạm tính</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongSoTienPhaiThu)
                }</Text>
              </View>
            </View>
            : null}
        </View>

        <View style={styles.cardWrapper}>
          <TouchableOpacity
            style={styles.rowSpaceBetween}
            onPress={() => changeIsShow("thongTinKhachHang")}>
            <Text style={styles.headerText}>
              Thông tin khách hàng
            </Text>
            {
              isShow.thongTinKhachHang ?
                <Entypo name="chevron-down" size={20} color="black"/> :
                <Entypo name="chevron-right" size={20} color="black"/>
            }
          </TouchableOpacity>
          {isShow.thongTinKhachHang ?
            <View style={styles.headerTopWrapper}>
              <Select
                style={{ marginBottom: 16 }}
                label="Mã khách hàng"
                placeholder='Chọn khách hàng'
                value={displayMaKhachHang()}
                selectedIndex={selectedIndex?.khachHang}
                onSelect={(index: any) => {
                  let _selectedIndex = { ...selectedIndex }
                  _selectedIndex.khachHang = index
                  let _thongtinKhachHang = { ...thongtinKhachHang }
                  _thongtinKhachHang.tenKhachHang = data?.listCustomer[index.row]?.customerName
                  _thongtinKhachHang.diaChi = data?.listCustomer[index.row]?.fullAddress
                  _thongtinKhachHang.maSoThue = data?.listCustomer[index.row]?.taxCode
                  _thongtinKhachHang.dienThoai = data?.listCustomer[index.row]?.customerPhone
                  _thongtinKhachHang.nguoiNhanHang = data?.listCustomer[index.row]?.customerName
                  _thongtinKhachHang.soNgayDuocNo = data?.listCustomer[index.row]?.countCustomerInfo?.toString()
                  _thongtinKhachHang.soNoToiDa = data?.listCustomer[index.row]?.countCustomerReference?.toString()
                  setThongtinKhachHang(_thongtinKhachHang)
                  setSelectedIndex(_selectedIndex)
                }}>
                {data?.listCustomer?.length ?
                  data?.listCustomer.map(item => {
                    return (
                      <SelectItem title={item?.customerCodeName}/>
                    )
                  })
                  : null}
              </Select>
              {selectedIndex?.khachHang ?
                <View>
                  <Input
                    style={{ marginBottom: 16 }}
                    label="Tên khách hàng"
                    placeholder='Tên khách hàng'
                    value={thongtinKhachHang?.tenKhachHang}
                    onChangeText={nextValue => changeThongTinKhacHang("tenKhachHang", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="Địa chỉ"
                    placeholder='Địa chỉ'
                    value={thongtinKhachHang?.diaChi}
                    onChangeText={nextValue => changeThongTinKhacHang("diaChi", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="Mã số thuế"
                    placeholder='Mã số thuế̉'
                    value={thongtinKhachHang?.maSoThue}
                    onChangeText={nextValue => changeThongTinKhacHang("maSoThue", nextValue)}
                  />
                  <Input
                    keyboardType="numeric"
                    style={{ marginBottom: 16 }}
                    label="Điện thoại"
                    placeholder="Điện thoại"
                    value={thongtinKhachHang?.dienThoai}
                    onChangeText={nextValue => changeThongTinKhacHang("dienThoai", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="Người nhận hàng"
                    placeholder="Người nhận hàng"
                    value={thongtinKhachHang?.nguoiNhanHang}
                    onChangeText={nextValue => changeThongTinKhacHang("nguoiNhanHang", nextValue)}
                  />
                  <Input
                    disabled={true}
                    style={{ marginBottom: 16 }}
                    label="Số ngày được nợ"
                    placeholder="Số ngày được nợ"
                    value={thongtinKhachHang?.soNgayDuocNo}
                    onChangeText={nextValue => changeThongTinKhacHang("soNgayDuocNo", nextValue)}
                  />
                  <Input
                    disabled={true}
                    style={{ marginBottom: 16 }}
                    label="Số nợ tối đa"
                    placeholder="Số nợ tối đa"
                    value={thongtinKhachHang?.soNoToiDa}
                    onChangeText={nextValue => changeThongTinKhacHang("soNoToiDa", nextValue)}
                  />
                  <Select
                    style={{ marginBottom: 16 }}
                    label="Phương thức thanh toán"
                    placeholder='Chọn phương thức thanh toán'
                    value={displayPhuongThucThanhToan()}
                    selectedIndex={selectedIndex?.thanhToan}
                    onSelect={(index: any) => {
                      let _selectedIndex = { ...selectedIndex }
                      _selectedIndex.thanhToan = index
                      setSelectedIndex(_selectedIndex)
                    }}>
                    {data?.listPaymentMethod?.length ?
                      data?.listPaymentMethod.map(item => {
                        return (
                          <SelectItem title={item?.categoryName}/>
                        )
                      })
                      : null}
                  </Select>
                </View>
                : null}
            </View>
            : null}
        </View>

        <View style={styles.cardWrapper}>
          <TouchableOpacity
            style={styles.rowSpaceBetween}
            onPress={() => changeIsShow("thongTinDonHang")}>
            <Text style={styles.headerText}>
              Thông tin đơn hàng
            </Text>
            {
              isShow.thongTinDonHang ?
                <Entypo name="chevron-down" size={20} color="black"/> :
                <Entypo name="chevron-right" size={20} color="black"/>
            }
          </TouchableOpacity>
          {isShow.thongTinDonHang ?
            <View style={styles.headerTopWrapper}>
              {/*{data?.customerOrderObject?.orderCode ?*/}
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Mã đơn hàng</Text>
                <Text style={styles.rowTextRight}>{data?.customerOrderObject?.orderCode}</Text>
              </View>
              {/*: null}*/}
              {data?.customerOrderObject?.orderDate ?
                <View style={styles.rowTextWrapper}>
                  <Text style={styles.rowTextLeft}>Ngày đặt hàng</Text>
                  <Text style={styles.rowTextRight}>{
                    _unitOfWork.formatDate(data?.customerOrderObject?.orderDate)
                  }</Text>
                </View>
                : null}
              {/*{data?.customerOrderObject?.seller ?*/}
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Nhân viên bán hàng</Text>
                <Text style={styles.rowTextRight}>{listEmployeeMapId[data?.customerOrderObject?.seller]}</Text>
              </View>
              {/*: null}*/}
              {/*{data?.customerOrderObject?.placeOfDelivery ?*/}
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Địa chỉ giao hàng</Text>
                <Text style={styles.rowTextRight}>{data?.customerOrderObject?.placeOfDelivery}</Text>
              </View>
              {/*: null}*/}
              {/*{data?.customerOrderObject?.description ?*/}
              <View style={[styles.rowTextWrapper, { marginBottom: 0 }]}>
                <Text style={styles.rowTextLeft}>Diễn giải</Text>
                <Text style={styles.rowTextRight}>{data?.customerOrderObject?.description}</Text>
              </View>
              {/*: null}*/}
            </View>
            : null}
        </View>

        <View style={styles.cardWrapper}>
          <TouchableOpacity
            style={styles.rowSpaceBetween}
            onPress={() => changeIsShow("chiTietSanPham")}>
            <Text style={styles.headerText}>
              Chi tiết sản phẩm
            </Text>
            {
              isShow.chiTietSanPham ?
                <Entypo name="chevron-down" size={20} color="black"/> :
                <Entypo name="chevron-right" size={20} color="black"/>
            }
          </TouchableOpacity>
          {isShow.chiTietSanPham ?
            <View style={styles.headerTopWrapper}>
              {
                data?.listCustomerOrderDetail?.length ?
                  <ScrollView
                    horizontal={true}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}>
                    {
                      <View style={{ flex: 1, marginTop: 8 }}>
                        <View>
                          <View style={{ flexDirection: "row", flex: 1 }}>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Mã sản phẩm
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Chất lượng gỗ
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Nhà cung cấp
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Đơn vị tính
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                Số lượng
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                Đơn giá
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                Thành tiền (VND)
                              </Text>
                            </View>
                          </View>
                          {
                            data?.listCustomerOrderDetail.map((item, index) => {
                              return (
                                <View
                                  key={"listOrderOfCustomer: " + index}
                                  style={{ flexDirection: "row", flex: 1 }}>
                                  <View
                                    style={[styles.bodyTable, { width: 150 }]}>
                                    <TouchableOpacity onPress={() => navigation.navigate("DetailSanPhamScreen", {
                                      id: item?.productId,
                                    })}>
                                      <Text style={{ color: "#007ad9", fontSize: 14 }}>
                                        {listProductMapId[item?.productId]}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150 }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {listChatLuongGoMapId[item?.chatLuongGoId]}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150 }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {item?.nameVendor}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150 }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {listDonViTinhMapId[listProductMapDonVi[item?.productId]]}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150, alignItems: "flex-end" }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {_unitOfWork.formatNumber(item?.quantity)}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150, alignItems: "flex-end" }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {_unitOfWork.formatNumber(item?.unitPrice)}
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[styles.bodyTable, { width: 150, alignItems: "flex-end" }]}>
                                    <View>
                                      <Text style={{ fontSize: 14 }}>
                                        {_unitOfWork.formatNumber(item?.quantity * item?.unitPrice)}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )
                            })
                          }
                        </View>
                      </View>
                    }
                  </ScrollView> :
                  <View>
                    <Text style={{}}>Không có dữ liệu</Text>
                  </View>
              }
            </View>
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
            headerText={data?.customerOrderObject?.orderCode ? data?.customerOrderObject?.orderCode : "CHI TIẾT ĐƠN HÀNG"}
            style={HEADER}
            titleStyle={HEADER_TITLE}
            leftIcon={"back"}
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
            keyExtractor={(item, index) => "chi-tiet-don-hang-" + index + String(item)}
          />
        </View>
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  rowTextWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  rowTextLeft: {
    color: color.palette.black,
  },
  rowTextRight: {
    color: color.palette.black,
    fontWeight: "500",
  },
  headerTopWrapper: {
    marginTop: 16, borderTopWidth: 1, borderTopColor: color.palette.lighterGrey, paddingTop: 16,
  },
  rowSpaceBetween: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerText: {
    color: color.palette.black, fontWeight: "500", fontSize: 15,
  },
  cardWrapper: {
    backgroundColor: color.palette.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: 6,
  },
  headTable: {
    flex: 1,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#c8c8c8",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: 50,
    // borderTopLeftRadius: 4,
    backgroundColor: "#F1F4F8",
  },
  headTableText: {
    color: "black", fontWeight: "500",
    fontSize: 14,
  },
  bodyTable: {
    flex: 1,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#c8c8c8",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: 50,
  },
  bodyTableInput: {
    flex: 1,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#c8c8c8",
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    color: color.palette.black,
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
})
