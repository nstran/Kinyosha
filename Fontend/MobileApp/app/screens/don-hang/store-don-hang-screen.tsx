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

  const goBack = (err = "C?? l???i x???y ra, vui l??ng th??? l???i", boolean = false) => {
    Alert.alert("Th??ng b??o", err,
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
              T????ng h????p ????n h??ng
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
                <Text style={styles.rowTextLeft}>T???ng ti???n h??ng tr?????c thu???</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>T???ng chi ph??</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>T???ng thu??? VAT</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienTruocThue)
                }</Text>
              </View>
              <Select
                value={selectedIndex?.row == 0 ? "Theo %" : "S??? ti???n"}
                style={{ marginBottom: 8 }}
                label={() => {
                  return (
                    <Text style={styles.inputLabel}>Chi???t kh???u theo t???ng ????n h??ng</Text>
                  )
                }}
                selectedIndex={selectedIndex}
                onSelect={index => setSelectedIndex(index)}>
                <SelectItem title='Theo %'/>
                <SelectItem title='S??? ti???n'/>
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
                <Text style={styles.rowTextLeft}>T???ng ti???n chi???t kh???u (VND)</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongTienChietKhau)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>T???ng s??? ti???n ph???i thu</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongSoTienPhaiThu)
                }</Text>
              </View>
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>T???ng gi?? v???n</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(0)
                }</Text>
              </View>
              <View style={[styles.rowTextWrapper]}>
                <Text style={styles.rowTextLeft}>L???i nhu???n t???m t??nh</Text>
                <Text style={styles.rowTextRight}>{
                  _unitOfWork.formatNumber(tongSoTienPhaiThu)
                }</Text>
              </View>
              <View style={[styles.rowTextWrapper, { marginBottom: 0 }]}>
                <Text style={styles.rowTextLeft}>% l???i nhu???n t???m t??nh</Text>
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
              Th??ng tin kh??ch h??ng
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
                label="M?? kha??ch ha??ng"
                placeholder='Ch???n kh??ch h??ng'
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
                    label="T??n kha??ch ha??ng"
                    placeholder='T??n kha??ch ha??ng'
                    value={thongtinKhachHang?.tenKhachHang}
                    onChangeText={nextValue => changeThongTinKhacHang("tenKhachHang", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="??i??a chi??"
                    placeholder='??i??a chi??'
                    value={thongtinKhachHang?.diaChi}
                    onChangeText={nextValue => changeThongTinKhacHang("diaChi", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="M?? s??? thu???"
                    placeholder='M?? s??? thu?????'
                    value={thongtinKhachHang?.maSoThue}
                    onChangeText={nextValue => changeThongTinKhacHang("maSoThue", nextValue)}
                  />
                  <Input
                    keyboardType="numeric"
                    style={{ marginBottom: 16 }}
                    label="??i????n thoa??i"
                    placeholder="??i???n tho???i"
                    value={thongtinKhachHang?.dienThoai}
                    onChangeText={nextValue => changeThongTinKhacHang("dienThoai", nextValue)}
                  />
                  <Input
                    style={{ marginBottom: 16 }}
                    label="Ng?????i nh???n h??ng"
                    placeholder="Ng?????i nh???n h??ng"
                    value={thongtinKhachHang?.nguoiNhanHang}
                    onChangeText={nextValue => changeThongTinKhacHang("nguoiNhanHang", nextValue)}
                  />
                  <Input
                    disabled={true}
                    style={{ marginBottom: 16 }}
                    label="S??? ng??y ???????c n???"
                    placeholder="S??? ng??y ???????c n???"
                    value={thongtinKhachHang?.soNgayDuocNo}
                    onChangeText={nextValue => changeThongTinKhacHang("soNgayDuocNo", nextValue)}
                  />
                  <Input
                    disabled={true}
                    style={{ marginBottom: 16 }}
                    label="S??? n??? t???i ??a"
                    placeholder="S??? n??? t???i ??a"
                    value={thongtinKhachHang?.soNoToiDa}
                    onChangeText={nextValue => changeThongTinKhacHang("soNoToiDa", nextValue)}
                  />
                  <Select
                    style={{ marginBottom: 16 }}
                    label="Ph????ng th???c thanh to??n"
                    placeholder='Ch???n ph????ng th???c thanh to??n'
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
              Th??ng tin ????n h??ng
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
                <Text style={styles.rowTextLeft}>M?? ????n h??ng</Text>
                <Text style={styles.rowTextRight}>{data?.customerOrderObject?.orderCode}</Text>
              </View>
              {/*: null}*/}
              {data?.customerOrderObject?.orderDate ?
                <View style={styles.rowTextWrapper}>
                  <Text style={styles.rowTextLeft}>Ng??y ?????t h??ng</Text>
                  <Text style={styles.rowTextRight}>{
                    _unitOfWork.formatDate(data?.customerOrderObject?.orderDate)
                  }</Text>
                </View>
                : null}
              {/*{data?.customerOrderObject?.seller ?*/}
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>Nh??n vi??n b??n h??ng</Text>
                <Text style={styles.rowTextRight}>{listEmployeeMapId[data?.customerOrderObject?.seller]}</Text>
              </View>
              {/*: null}*/}
              {/*{data?.customerOrderObject?.placeOfDelivery ?*/}
              <View style={styles.rowTextWrapper}>
                <Text style={styles.rowTextLeft}>?????a ch??? giao h??ng</Text>
                <Text style={styles.rowTextRight}>{data?.customerOrderObject?.placeOfDelivery}</Text>
              </View>
              {/*: null}*/}
              {/*{data?.customerOrderObject?.description ?*/}
              <View style={[styles.rowTextWrapper, { marginBottom: 0 }]}>
                <Text style={styles.rowTextLeft}>Di???n gi???i</Text>
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
              Chi ti???t s???n ph???m
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
                                M?? s???n ph???m
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Ch???t l?????ng g???
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                Nh?? cung c???p
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150 }]}>
                              <Text style={[styles.headTableText]}>
                                ????n v??? t??nh
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                S??? l?????ng
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                ????n gi??
                              </Text>
                            </View>
                            <View style={[styles.headTable, { width: 150, alignItems: "center" }]}>
                              <Text style={[styles.headTableText]}>
                                Th??nh ti???n (VND)
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
                    <Text style={{}}>Kh??ng c?? d??? li???u</Text>
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
            headerText={data?.customerOrderObject?.orderCode ? data?.customerOrderObject?.orderCode : "CHI TI???T ????N H??NG"}
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
