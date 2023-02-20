import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  FlatList,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import { Header, Loading, Screen, Text } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import RNDatePicker from "@react-native-community/datetimepicker"
import DatePicker from "react-native-datepicker"
import {
  RadioGroup,
  Radio,
  Button,
  Input,
  SelectItem,
  IndexPath,
  Layout,
  Select,
  Icon,
  Datepicker,
  CheckBox,
} from "@ui-kitten/components"
import { FontAwesome5, AntDesign, EvilIcons } from "@expo/vector-icons"
import MaskInput, { createNumberMask } from "react-native-mask-input"

const dollarMask = createNumberMask({
  delimiter: ",",
  separator: ",",
  precision: 3,
})
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

export const TaoBaoGiaScreen = observer(function TaoBaoGiaScreen() {
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [ngayDuKien, setNgayDuKien] = useState(null)
  const [checkRadio, setCheckRadio] = useState(true)
  const [checkDaBaoGomTrongGiaBan, setCheckDaBaoGomTrongGiaBan] = useState(true)
  const [formDataThongTinKhachHang, setFormDataThongTinKhachHang] = useState({
    sdt: "",
    email: "",
    diaChi: "",
    soNgayDuocNo: 0,
    soNoToiDa: 0,
  })

  const [check, setCheck] = useState({
    themSanPhamDichVu: false,
    themThongTinChiPhi: false,
    themKeHoachTrienKhai: false,
    themDieuKhoanThanhToan: false,
  })

  const [formDataSelectThongTinKhachHang, setFormDataSelectThongTinKhachHang] = useState({
    selectedKhachHangDinhDanh: null,
    selectedKhachHangTiemNang: null,
    selectedPhuongThucThanhToan: null,
    selectedChiTietBaoGia: new IndexPath(0),
    selectedListNhanVienBanHang: null,
    selectedKenhBanHang: null,
    selectedChiPhi: null,
  })

  const [indexListData,setIndexListData]= useState({
      indexListChiPhi:1
  })

  const [formDataChiTietSanPham, setFormDataChiTietSanPham] = useState({
    maSanPhamDichVu: "",
    tenSanPhamDichVu: "",
    soLuong: null,
    donViTinh: "",
    donGia: null,
    donViTien: null,
    tyGia: null,
    nhaCungCap: "",
    thueGTGT: "",
    chietKhau: "",
    thanhTien: "",
  })

  const [formDataChiPhi, setFormDataChiPhi] = useState({
    indexChiPhi:null,
    maChiPhi : "",
    tenChiPhi: "",
    soLuong: "",
    donGia: "",
    thanhTien: "",
    check: true,
  })

  const [listSanPhamDichVu, setListSanPhamDichVu] = useState<any>([])
  const [listSelectNguoiThamGia, setListSelectNguoiThamGia] = useState<any>([])

  const [listKhachHangDinhDanh, setListKhachHangDinhDanh] = useState<any>([])
  const [listKhachHangTiemNang, setListKhachHangTiemNang] = useState<any>([])
  const [listPhuongThucThanhToan, setListPhuongThucThanhToan] = useState<any>([])
  const [listNhanVienBanHang, setListNhanVienBanHang] = useState<any>([])
  const [listNguoiThamGia, setListNguoiThamGia] = useState<any>([])
  const [listKenhBanHang, setListKenhBanHang] = useState<any>([])
  const [listChiPhi, setListChiPhi] = useState<any>([])
  const [listDataThongTinChiPhi, setListDataThongTinChiPhi] = useState<any>([])
  const listChiTietBaoGia = [
    "Thông tin báo giá",
    "Thông tin sản phẩm dịch vụ",
    "Thông tin chi phí",
    "Phạm vi công việc",
    "kế hoạch triển khai",
    "Điều khoản thanh toán",
    "Tài liệu liên quan",
    "Thông tin bổ sung",
  ]

  const displayKhachHangDinhDanh = () => {
    if (formDataSelectThongTinKhachHang.selectedKhachHangDinhDanh) {
      return listKhachHangDinhDanh[formDataSelectThongTinKhachHang?.selectedKhachHangDinhDanh?.row]
        ?.customerCodeName
    }
    return ""
  }

  const displayKhachHangTiemNang = () => {
    if (formDataSelectThongTinKhachHang.selectedKhachHangTiemNang) {
      return listKhachHangTiemNang[formDataSelectThongTinKhachHang?.selectedKhachHangTiemNang?.row]
        ?.customerCodeName
    }
    return ""
  }

  const displayPhuongThucThanhToan = () => {
    if (formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan) {
      return listPhuongThucThanhToan[
        formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan?.row
      ]?.categoryName
    }
    return ""
  }
  const displayChiTietBaoGia = () => {
    if (formDataSelectThongTinKhachHang.selectedChiTietBaoGia) {
      return listChiTietBaoGia[formDataSelectThongTinKhachHang.selectedChiTietBaoGia?.row]
    }
    return ""
  }

  const displayNhanVienBanHang = () => {
    if (formDataSelectThongTinKhachHang.selectedListNhanVienBanHang) {
      return listNhanVienBanHang[formDataSelectThongTinKhachHang.selectedListNhanVienBanHang?.row]
        .employeeCodeName
    }
    return ""
  }

  const displayKenhBanHang = () => {
    if (formDataSelectThongTinKhachHang.selectedKenhBanHang) {
      return listKenhBanHang[formDataSelectThongTinKhachHang.selectedKenhBanHang?.row].categoryName
    }
    return ""
  }

  const displayChiPhi = () => {
    if (formDataSelectThongTinKhachHang.selectedChiPhi) {
      return listChiPhi[formDataSelectThongTinKhachHang.selectedChiPhi?.row].costCodeName
    }
    return ""
  }

  const displayNguoiThamGia = listSelectNguoiThamGia.map((index) => {
    return listNguoiThamGia[index.row]?.employeeCodeName
  })

  const renderOptionKhachHangDinhDanh = (title) => (
    <SelectItem key={title?.customerId} title={title?.customerCodeName} />
  )

  const renderOptionKhachHangTiemNang = (title) => (
    <SelectItem key={title?.customerId} title={title?.customerCodeName} />
  )

  const renderOptionPhuongThucThanhToan = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )
  const renderOptionChiTietBaoGia = (title) => <SelectItem key={title} title={title} />

  const renderOptionNhanVienBanHang = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCodeName} />
  )
  const renderOptionNguoiThamGia = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCodeName} />
  )
  const renderOptionKenhBanHang = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )

  const renderOptionChiPhi = (title) => (
    <SelectItem key={title?.costId} title={title?.costCodeName} />
  )
  function formatDate(date) {
    return date?.getDate() + "/" + (parseInt(date?.getMonth()) + 1) + "/" + date?.getFullYear()
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
  const formatNumber = (num) => {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
  }
  const updateInfoAfterSelect = (index) => {
    let idPersion = listKhachHangDinhDanh[index?.row].personInChargeId
    let _formDataThongTinKhachHang = { ...formDataThongTinKhachHang }
    if (checkRadio === true) {
      _formDataThongTinKhachHang.sdt = listKhachHangDinhDanh[index?.row].customerPhone
      _formDataThongTinKhachHang.email = listKhachHangDinhDanh[index?.row].customerEmail
      _formDataThongTinKhachHang.diaChi = listKhachHangDinhDanh[index?.row].fullAddress
    } else {
      _formDataThongTinKhachHang.sdt = listKhachHangTiemNang[index?.row].customerPhone
      _formDataThongTinKhachHang.email = listKhachHangTiemNang[index?.row].customerEmail
      _formDataThongTinKhachHang.diaChi = listKhachHangTiemNang[index?.row].fullAddress
    }

    setFormDataThongTinKhachHang(_formDataThongTinKhachHang)
  }

  const updateSelectAfterSelect = (index) => {
    let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
    if (checkRadio === true) {
      let idPersion = listKhachHangDinhDanh[index?.row].personInChargeId
      listNhanVienBanHang.forEach((item, index2) => {
        if (item.employeeId === idPersion) {
          _formDataSelectThongTinKhachHang.selectedListNhanVienBanHang = new IndexPath(index2)
        }
      })
    } else {
      let idPersion = listKhachHangTiemNang[index?.row].personInChargeId
      listNhanVienBanHang.forEach((item, index2) => {
        if (item.employeeId === idPersion) {
          let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
          _formDataSelectThongTinKhachHang.selectedListNhanVienBanHang = new IndexPath(index2)
        }
      })
    }

    setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
  }

  useEffect(() => {
    fetchData()
  }, [isRefresh, isFocused])
  const fetchData = async () => {
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)

      let payload = {
        ObjectId: null,
        ObjectType: null,
      }
      let responseGetMasterDataCreateQuote = await _unitOfWork.user.getMasterDataCreateQuote(
        payload,
      )
      if (responseGetMasterDataCreateQuote.data?.statusCode != 200) {
        goBack(responseGetMasterDataCreateQuote.data?.messageCode)
        return
      }
      setListKhachHangDinhDanh(responseGetMasterDataCreateQuote.data?.listCustomer)
      setListKhachHangTiemNang(responseGetMasterDataCreateQuote.data?.listCustomerNew)
      setListPhuongThucThanhToan(responseGetMasterDataCreateQuote.data?.listPaymentMethod)
      setListNhanVienBanHang(responseGetMasterDataCreateQuote.data?.listEmployee)
      setListNguoiThamGia(responseGetMasterDataCreateQuote.data?.listParticipant)
      setListKenhBanHang(responseGetMasterDataCreateQuote.data?.listInvestFund)

      let payloadGetMasterDataCreateCost = {}
      let responseGetMasterDataCreateCost = await _unitOfWork.user.getMasterDataCreateCost(
        payloadGetMasterDataCreateCost,
      )
      if (responseGetMasterDataCreateCost.data?.statusCode != 200) {
        goBack(responseGetMasterDataCreateCost.data?.messageCode)
        return
      }
      setListChiPhi(responseGetMasterDataCreateCost.data.listCost)
      setLoading(false)
    }
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  const addChiPhi = ()=>{
      console.log(indexListData.indexListChiPhi)
      let _listDataThongTinChiPhi = [...listDataThongTinChiPhi]
      _listDataThongTinChiPhi.push({
          indexChiPhi:indexListData.indexListChiPhi,
          maChiPhi: formDataChiPhi.maChiPhi,
          tenChiPhi: formDataChiPhi.tenChiPhi,
          soLuong: formDataChiPhi.soLuong,
          donGia: formDataChiPhi.donGia,
          thanhTien: formDataChiPhi.thanhTien,
          BaoGomTrongGiaBan:checkDaBaoGomTrongGiaBan,
      })
      let _indexListData = {...indexListData}
      _indexListData.indexListChiPhi = _indexListData.indexListChiPhi+1
      setIndexListData(_indexListData)
      console.log(_listDataThongTinChiPhi)
      setListDataThongTinChiPhi(_listDataThongTinChiPhi)

  }
  const deleteChiPhi = (value: number) => {
    let _listDataThongTinChiPhi = [...listDataThongTinChiPhi]
    let indexInArray
    _listDataThongTinChiPhi.forEach((item,index)=>{
        if(Number(item?.indexChiPhi) === Number(value)){
            indexInArray = item
        }

    })
    const new_arr = listDataThongTinChiPhi.filter(item => item !== indexInArray)
    setListDataThongTinChiPhi(new_arr)
  }
  const thongBao = (thongBao: string) => {
    Alert.alert(
      "Thông báo",
      thongBao,
      [
        {
          text: "OK",
        },
      ],
      { cancelable: false },
    )
  }

  const resetDataThongTinChiPhi = ()=>{
      let _formDataChiPhi = {...formDataChiPhi}
      _formDataChiPhi.maChiPhi =""
      _formDataChiPhi.tenChiPhi =""
      _formDataChiPhi.soLuong =""
      _formDataChiPhi.donGia =""
      _formDataChiPhi.thanhTien =""
      setFormDataChiPhi(_formDataChiPhi)
      let _formDataSelectThongTinKhachHang = {...formDataSelectThongTinKhachHang}
      _formDataSelectThongTinKhachHang.selectedChiPhi = null
      setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
  }

  const itemListChiPhi = (item)=>{
      return(
          <View style={styles.cardHeader}>
                      <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Mã chi phí: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.maChiPhi}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Tên chi phí: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.tenChiPhi}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Số lượng: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.soLuong}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Đơn giá: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.donGia}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Thành tiền: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.thanhTien}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Bao gồm trong giá bán: </Text>
          <Text style={styles.cardBodyTextRight}>{item?.baoGomTrongGiaBan}</Text>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Xóa: </Text>
          <TouchableOpacity onPress={() => deleteChiPhi(item?.indexChiPhi)}>
          <View style={styles.buttonDelete}>
            <AntDesign name="delete" size={20} color="white" />
          </View>
        </TouchableOpacity>
        </View>

        <View style={styles.cardBodyWrapper}>
          <Text style={styles.cardBodyTextLeft}>Update: </Text>
      <TouchableOpacity >
          <View style={styles.buttonUpdate}>
            <EvilIcons name="pencil" size={24} color="white" />
          </View>
        </TouchableOpacity>
        </View>

          </View>
      )
  }

  const updateCheck = (value: number) => {
    let _check = { ...check }
    ;(_check.themSanPhamDichVu = false),
      (_check.themThongTinChiPhi = false),
      (_check.themKeHoachTrienKhai = false),
      (_check.themDieuKhoanThanhToan = false)
    if (value === 2) {
      _check.themSanPhamDichVu = true
    }
    if (value === 3) {
      _check.themThongTinChiPhi = true
    }
    if (value === 5) {
      _check.themKeHoachTrienKhai = true
    }
    if (value === 6) {
      _check.themDieuKhoanThanhToan = true
    }
    setCheck(_check)
  }
  const thongTinBaoGiaComponent = () => {
    return (
      <View>
        <Text style={styles.contenerTextBoody}>Mã báo giá: sẽ được hệ thống tạo sau khi lưu</Text>
        <Text style={styles.contenerTextBoody}>Ngày tạo: {formatDate(new Date())}</Text>
        <Text style={styles.contenerTextBoody}>Tên báo giá*</Text>
        <Input
        // value={String(formDataThongTinKhachHang.soNoToiDa)}
        // onChangeText={(text) => {
        //   let _formDataThongTin = { ...formDataThongTin }
        //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
        // }}
        ></Input>
        <Text style={styles.contenerTextBoody}>Ngày dự kiến*</Text>
        <DatePicker
          style={styles.stylesForDate}
          locale={"vi"}
          display="spinner"
          showIcon={false}
          mode="date"
          placeholder="Ngày dự kiến"
          format="DD/MM/YYYY"
          minDate={new Date()}
          confirmBtnText="Xác nhận"
          cancelBtnText="Huỷ"
          date={ngayDuKien}
          onDateChange={(date) => {
            let _arr = date.split("/")
            let d = new Date(_arr[2], _arr[1] - 1, _arr[0], 7, 0, 0)
            setNgayDuKien(d)
          }}
          iOSDatePickerComponent={(props) => (
            <RNDatePicker {...props} display={Platform.OS === "ios" ? "spinner" : "default"} />
          )}
          customStyles={{
            dateInput: {
              borderWidth: 0,
              padding: 0,
              margin: 0,
              // marginLeft: -68,
              alignItems: "flex-start",
            },
            btnTextConfirm: { color: "blue" },
            btnTextCancel: { color: "blue" },
            datePicker: { backgroundColor: "white" },
            datePickerCon: { backgroundColor: "white" },
          }}
        />

        <Text style={styles.contenerTextBoody}>Nhân viên bán hàng*</Text>
        <Layout level="1">
          <Select
            style={styles.select}
            placeholder="Chọn nhân viên bán hàng"
            value={displayNhanVienBanHang()}
            selectedIndex={formDataSelectThongTinKhachHang.selectedListNhanVienBanHang}
            onSelect={(index) => {
              let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
              _formDataSelectThongTinKhachHang.selectedListNhanVienBanHang = index
              setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
            }}
            //   status={
            //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
            //       ? "danger"
            //       : "basic"
            //   }
          >
            {listNhanVienBanHang.map(renderOptionNhanVienBanHang)}
          </Select>
        </Layout>

        <Text style={styles.contenerTextBoody}>Ngày báo giá</Text>
        <DatePicker
          style={styles.stylesForDate}
          locale={"vi"}
          display="spinner"
          showIcon={false}
          mode="date"
          placeholder="Ngày dự kiến"
          format="DD/MM/YYYY"
          minDate={new Date()}
          confirmBtnText="Xác nhận"
          cancelBtnText="Huỷ"
          date={ngayDuKien}
          onDateChange={(date) => {
            let _arr = date.split("/")
            let d = new Date(_arr[2], _arr[1] - 1, _arr[0], 7, 0, 0)
            setNgayDuKien(d)
          }}
          iOSDatePickerComponent={(props) => (
            <RNDatePicker {...props} display={Platform.OS === "ios" ? "spinner" : "default"} />
          )}
          customStyles={{
            dateInput: {
              borderWidth: 0,
              padding: 0,
              margin: 0,
              // marginLeft: -68,
              alignItems: "flex-start",
            },
            btnTextConfirm: { color: "blue" },
            btnTextCancel: { color: "blue" },
            datePicker: { backgroundColor: "white" },
            datePickerCon: { backgroundColor: "white" },
          }}
        />
        <Text style={styles.contenerTextBoody}>Người tham gia</Text>
        <Layout level="1">
          <Select
            multiSelect={true}
            style={styles.select}
            placeholder="Chọn người tham gia"
            value={displayNguoiThamGia.join(", ")}
            selectedIndex={listSelectNguoiThamGia}
            onSelect={(index) => setListSelectNguoiThamGia(index)}
          >
            {listNguoiThamGia.map(renderOptionNguoiThamGia)}
          </Select>
        </Layout>

        <Text style={styles.contenerTextBoody}>Ngày hiệu lực*</Text>
        <Input
          keyboardType="numeric"
          // value={String(formDataThongTinKhachHang.soNoToiDa)}
          // onChangeText={(text) => {
          //   let _formDataThongTin = { ...formDataThongTin }
          //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
          // }}
        ></Input>

        <Text style={styles.contenerTextBoody}>Hồ sơ thầu*</Text>
        <Layout level="1">
          <Select
            style={styles.select}
            placeholder="Chọn hồ sơ thầu"
            //   value={displayNguoiPhuTrach()}
            //   selectedIndex={formDataSelect.selectedNguoiPhuTrach}
            //   onSelect={(index) => {
            //     let _formDataSelect = { ...formDataSelect }
            //     _formDataSelect.selectedNguoiPhuTrach = index
            //     setFormDataSelect(_formDataSelect)
            //   }}
            //   status={
            //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
            //       ? "danger"
            //       : "basic"
            //   }
          >
            {/* {listDataNguoiPhuTrach.map(renderOptionNguoiPhuTrach)} */}
          </Select>
        </Layout>

        <Text style={styles.contenerTextBoody}>kênh bán hàng</Text>
        <Layout level="1">
          <Select
            style={styles.select}
            placeholder="Chọn kênh bán hàng"
            value={displayKenhBanHang()}
            selectedIndex={formDataSelectThongTinKhachHang.selectedKenhBanHang}
            onSelect={(index) => {
              let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
              _formDataSelectThongTinKhachHang.selectedKenhBanHang = index
              setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
            }}
            //   status={
            //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
            //       ? "danger"
            //       : "basic"
            //   }
          >
            {listKenhBanHang.map(renderOptionKenhBanHang)}
          </Select>
        </Layout>

        <Text style={styles.contenerTextBoody}>Cơ hội</Text>
        <Layout level="1">
          <Select
            style={styles.select}
            placeholder="Chọn cơ hội"
            //   value={displayNguoiPhuTrach()}
            //   selectedIndex={formDataSelect.selectedNguoiPhuTrach}
            //   onSelect={(index) => {
            //     let _formDataSelect = { ...formDataSelect }
            //     _formDataSelect.selectedNguoiPhuTrach = index
            //     setFormDataSelect(_formDataSelect)
            //   }}
            //   status={
            //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
            //       ? "danger"
            //       : "basic"
            //   }
          >
            {/* {listDataNguoiPhuTrach.map(renderOptionNguoiPhuTrach)} */}
          </Select>
        </Layout>
      </View>
    )
  }
  const thongTinSanPhamDichVuComponent = () => {
    return (
      <View>
        <Button
          onPress={() => {
            updateCheck(2)
          }}
        >
          Thêm sản phẩm dịch vụ
        </Button>
        <View></View>
      </View>
    )
  }
  const formThemChiPhi = () => {
    ;<View>
      <Text style={styles.contenerTextBoody}>Chọn chi phí</Text>
      {/* <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn chi phí"
            //   value={displayPhuongThucThanhToan()}
            //   selectedIndex={formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan}
            //   onSelect={(index) => {
            //     let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
            //     _formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan = index
            //     setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
            //   }}
              //   status={
              //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //       ? "danger"
              //       : "basic"
              //   }
            >
              {listPhuongThucThanhToan.map(renderOptionPhuongThucThanhToan)}
            </Select>
          </Layout> */}
    </View>
  }

  const thongTinChiPhiComponent = () => {
    return (
      <View>
        <Button
          onPress={() => {
            updateCheck(3)
          }}
        >
          Thêm thông tin chi phí
        </Button>
        {check.themThongTinChiPhi === true && (
          <View>
            <Text style={styles.contenerTextBoody}>Chọn chi phí</Text>
            <Layout level="1">
              <Select
                style={styles.select}
                placeholder="Chọn chi phí"
                value={displayChiPhi()}
                selectedIndex={formDataSelectThongTinKhachHang.selectedChiPhi}
                onSelect={(index) => {
                  let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
                  _formDataSelectThongTinKhachHang.selectedChiPhi = index
                  setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
                  let _formDataChiPhi = { ...formDataChiPhi }
                  _formDataChiPhi.tenChiPhi = listChiPhi[index?.row]?.costName
                  _formDataChiPhi.maChiPhi = listChiPhi[index?.row]?.costCode
                  setFormDataChiPhi(_formDataChiPhi)
                }}
                //   status={
                //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
                //       ? "danger"
                //       : "basic"
                //   }
              >
                {listChiPhi.map(renderOptionChiPhi)}
              </Select>
            </Layout>

            <Text style={styles.contenerTextBoody}>Tên chi phí</Text>
            <Input value={formDataChiPhi.tenChiPhi}></Input>

            <Text style={styles.contenerTextBoody}>Số lượng*</Text>
            <MaskInput
              style={[styles.stylesForDate, { height: 40 }]}
              value={formDataChiPhi.soLuong}
              mask={dollarMask}
              onChangeText={(masked, unmasked) => {
                let _formDataChiPhi = { ...formDataChiPhi }
                _formDataChiPhi.soLuong = unmasked
                _formDataChiPhi.thanhTien = String(
                  Number(unmasked) * Number(_formDataChiPhi.donGia),
                )
                setFormDataChiPhi(_formDataChiPhi)
              }}
            />

            <Text style={styles.contenerTextBoody}>Đơn giá*</Text>
            <MaskInput
              style={[styles.stylesForDate, { height: 40 }]}
              value={formDataChiPhi.donGia}
              mask={dollarMask}
              onChangeText={(masked, unmasked) => {
                let _formDataChiPhi = { ...formDataChiPhi }
                _formDataChiPhi.donGia = unmasked
                _formDataChiPhi.thanhTien = String(
                  Number(unmasked) * Number(_formDataChiPhi.soLuong),
                )
                setFormDataChiPhi(_formDataChiPhi)
              }}
            />

            <Text style={styles.contenerTextBoody}>Thành tiền(VND)</Text>
            <Input disabled={true} value={formatNumber(formDataChiPhi.thanhTien)}></Input>
            <View style={styles.headerButton}>
              <View >
                <CheckBox
                  checked={checkDaBaoGomTrongGiaBan}
                  onChange={(nextChecked) => setCheckDaBaoGomTrongGiaBan(nextChecked)}>
                  Đã bao gồm trong giá bán
                </CheckBox>
              </View>

                <Button onPress={() =>{addChiPhi()}}>Lưu</Button>
                <Button onPress={()=>{updateCheck(0),resetDataThongTinChiPhi()}}>Hủy</Button>

            </View>
          </View>
        )}
        {listDataThongTinChiPhi.length > 0 && 
        <View>
            <View style={styles.cardHeader}>
            <Text style={styles.contenerTextHeader}>list chi phí</Text>
            </View>
            {listDataThongTinChiPhi.map(itemListChiPhi)}
            </View>}
      </View>
    )
  }
  const topComponent = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.headerButton}>
          <Button style={styles.button1}>Thoát</Button>
          <Button style={styles.button2}>Lưu và thêm tạo mới</Button>
          <Button style={styles.button1}>Lưu</Button>
        </View>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <Text style={styles.contenerTextHeader}>
            <FontAwesome5 name="chevron-circle-down" size={17} color="black" /> Thông tin khách hàng
          </Text>
          <View style={styles.contenerRadio}>
            <Radio
              style={{ marginBottom: 6 }}
              checked={checkRadio}
              onChange={() => {
                setCheckRadio(true)
              }}
            >
              Khách hàng định danh
            </Radio>
            <Radio
              style={{ marginBottom: 6 }}
              checked={!checkRadio}
              onChange={() => {
                setCheckRadio(false)
              }}
            >
              Khách hàng tiềm năng
            </Radio>
          </View>
          <Text style={styles.contenerTextBoody}>
            {checkRadio === true ? "Khách hàng định danh*" : "Khách hàng tiềm năng*"}
          </Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder={
                checkRadio === true ? "Chọn Khách hàng định danh*" : "Chọn Khách hàng tiềm năng*"
              }
              value={checkRadio === true ? displayKhachHangDinhDanh() : displayKhachHangTiemNang()}
              selectedIndex={
                checkRadio === true
                  ? formDataSelectThongTinKhachHang.selectedKhachHangDinhDanh
                  : formDataSelectThongTinKhachHang.selectedKhachHangTiemNang
              }
              onSelect={(index) => {
                let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
                {
                  checkRadio === true
                    ? (_formDataSelectThongTinKhachHang.selectedKhachHangDinhDanh = index)
                    : (_formDataSelectThongTinKhachHang.selectedKhachHangTiemNang = index)
                }
                setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
                updateInfoAfterSelect(index)
                updateSelectAfterSelect(index)
              }}
              //   status={
              //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //       ? "danger"
              //       : "basic"
              //   }
            >
              {checkRadio === true
                ? listKhachHangDinhDanh.map(renderOptionKhachHangDinhDanh)
                : listKhachHangTiemNang.map(renderOptionKhachHangTiemNang)}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Số điện thoại</Text>
          <Input
            keyboardType="numeric"
            disabled={true}
            value={formDataThongTinKhachHang.sdt}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.sdt = text), setFormDataThongTin(_formDataThongTin)
            //   // checkDuplicateInforCustomerPhone()
            // }}
            // status={validateSdt(formDataThongTin.sdt) === false ? "danger" : "basic"}
          ></Input>

          <Text style={styles.contenerTextBoody}>Email</Text>
          <Input
            disabled={true}
            keyboardType="email-address"
            value={formDataThongTinKhachHang.email}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.email = text), setFormDataThongTin(_formDataThongTin)
            //   // checkDuplicateInforCustomerEmail()
            // }}
            // status={validateEmail(formDataThongTin.email) === false ? "danger" : "basic"}
          ></Input>

          <Text style={styles.contenerTextBoody}>Địa chỉ</Text>
          <Input
            disabled={true}
            value={formDataThongTinKhachHang.diaChi}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
            // }}
          ></Input>

          <Text style={styles.contenerTextBoody}>Phương thức thanh toán</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn Phương thức thanh toán"
              value={displayPhuongThucThanhToan()}
              selectedIndex={formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan}
              onSelect={(index) => {
                let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
                _formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan = index
                setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
              }}
              //   status={
              //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //       ? "danger"
              //       : "basic"
              //   }
            >
              {listPhuongThucThanhToan.map(renderOptionPhuongThucThanhToan)}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Số ngày được nợ</Text>
          <Input
            value={String(formDataThongTinKhachHang.soNgayDuocNo)}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
            // }}
          ></Input>

          <Text style={styles.contenerTextBoody}>Số nợ tối đa</Text>
          <Input
            value={String(formDataThongTinKhachHang.soNoToiDa)}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
            // }}
          ></Input>

          {formDataSelectThongTinKhachHang.selectedKhachHangDinhDanh !== null ||
          formDataSelectThongTinKhachHang.selectedKhachHangTiemNang !== null ? (
            <View>
              <Text style={styles.contenerTextBoody}>Tài khoản ngân hàng</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder=""
                  // value={displayPhuongThucThanhToan()}
                  // selectedIndex={formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan}
                  // onSelect={(index) => {
                  //   let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
                  //   _formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan = index
                  //   setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
                  // }}
                  //   status={
                  //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
                  //       ? "danger"
                  //       : "basic"
                  //   }
                >
                  {/* {listPhuongThucThanhToan.map(renderOptionPhuongThucThanhToan)} */}
                </Select>
              </Layout>
            </View>
          ) : (
            <View></View>
          )}
        </View>
      </View>
    )
  }

  const chiTietBaoGiaComponent = () => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <Text style={styles.contenerTextHeader}>
            <FontAwesome5 name="chevron-circle-down" size={17} color="black" /> Chi tiết báo giá
          </Text>
          <Layout level="1">
            <Select
              style={styles.select}
              value={displayChiTietBaoGia()}
              selectedIndex={formDataSelectThongTinKhachHang.selectedChiTietBaoGia}
              onSelect={(index) => {
                let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
                _formDataSelectThongTinKhachHang.selectedChiTietBaoGia = index
                setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
              }}
              //   status={
              //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //       ? "danger"
              //       : "basic"
              //   }
            >
              {listChiTietBaoGia.map(renderOptionChiTietBaoGia)}
            </Select>
          </Layout>
          {formDataSelectThongTinKhachHang.selectedChiTietBaoGia?.row === 0 &&
            thongTinBaoGiaComponent()}
          {formDataSelectThongTinKhachHang.selectedChiTietBaoGia?.row === 1 &&
            thongTinSanPhamDichVuComponent()}
          {formDataSelectThongTinKhachHang.selectedChiTietBaoGia?.row === 2 &&
            thongTinChiPhiComponent()}
        </View>
      </View>
    )
  }
  const TongHopBaoGiaComponent = () => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <Text style={styles.contenerTextHeader}>Tổng hợp báo giá</Text>
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Khách hàng: </Text>
            <Text style={styles.cardBodyTextRight}>Test</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng giá trị hàng hóa bán ra: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng giá trị hàng hóa bán vào: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng chi phí: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng thuế VAT: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng tiền sau thuế: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng tiền khuyến mại: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>
          <Text style={styles.contenerTextBoody}>Chiết khấu theo báo giá</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder=""
              // value={displayPhuongThucThanhToan()}
              // selectedIndex={formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan}
              // onSelect={(index) => {
              //   let _formDataSelectThongTinKhachHang = { ...formDataSelectThongTinKhachHang }
              //   _formDataSelectThongTinKhachHang.selectedPhuongThucThanhToan = index
              //   setFormDataSelectThongTinKhachHang(_formDataSelectThongTinKhachHang)
              // }}
              //   status={
              //     formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //       ? "danger"
              //       : "basic"
              //   }
            >
              {/* {listPhuongThucThanhToan.map(renderOptionPhuongThucThanhToan)} */}
            </Select>
          </Layout>
          <Input></Input>
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng tiền thành triết khấu: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Tổng thanh toán: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>Lợi nhuận tạm tính: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>

          <View style={styles.cardBodyWrapper}>
            <Text style={styles.cardBodyTextLeft}>% lợi nhuận tạm tính: </Text>
            <Text style={styles.cardBodyTextRight}>0</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <>
      {isLoading && <Loading />}
      <Screen style={ROOT} preset="fixed">
        <View style={{ flex: 1 }}>
          <Header
            headerText="TẠO TIỀM NĂNG"
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
            ListEmptyComponent={chiTietBaoGiaComponent()}
            ListFooterComponent={TongHopBaoGiaComponent()}
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
  headerButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 4,
    height: 60,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  headerButton2: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 4,
    height: 60,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  button1: {
    width: "20%",
    height: 45,
  },
  button11: {
    width: "20%",
    height: 45,
    marginRight: 10,
  },
  button2: {
    width: "45%",
    height: 45,
  },
  contenerTextHeader: {
    color: "black",
    fontSize: 17,
    marginBottom: 6,
    fontWeight: "700",
  },
  contenerRadio: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
  },
  contenerBoody: {},
  contenerTextBoody: {
    color: "black",
    fontSize: 15,
    marginBottom: 6,
    marginTop: 6,
  },
  select: {
    backgroundColor: "#fff",
    marginVertical: 6,
  },
  inputMul: {
    backgroundColor: "#fff",
    marginVertical: 6,
    minHeight: 64,
  },
  contenerNguoiLienHe: {
    borderTopWidth: 1,
    borderTopColor: "black",
    flex: 1,
    flexDirection: "row",
    marginBottom: 6,
    justifyContent: "space-around",
    paddingTop: 6,
  },
  contenerNguoiLienHeText: {
    color: "black",
    fontSize: 15,
    marginBottom: 4,
  },
  thongTinLienHe: {
    marginTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  contenerNguoiLienHeLeft: {
    width: "30%",
    height: "auto",
  },
  contenerNguoiLienHeMid: {
    width: "40%",
    height: "auto",
  },
  contenerNguoiLienHeRight: {
    width: "10%",
    height: "auto",
  },
  buttonUpdate: {
    width: 35,
    height: 35,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 6,
  },
  buttonDelete: {
    width: 35,
    height: 35,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  stylesForDate: {
    borderWidth: 1,
    width: "100%",
    paddingLeft: 6,
    borderRadius: 5,
    backgroundColor: "rgb(247, 249, 252)",
    borderColor: "rgb(228, 233, 242)",
  },
  cardHeader: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    borderColor: color.palette.lighterGrey,
    marginBottom: 2,
  },
  cardBodyWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    justifyContent: "space-between",
  },
  cardBodyTextLeft: {
    color: color.palette.black,
    fontSize: 15,
  },
  cardBodyTextRight: {
    color: color.palette.black,
    fontSize: 15,
  },
})
