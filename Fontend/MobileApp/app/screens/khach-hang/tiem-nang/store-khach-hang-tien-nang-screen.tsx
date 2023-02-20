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
  Keyboard
} from "react-native"
import { Header, Loading, Screen, Text } from "../../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../../theme"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { UnitOfWorkService } from "../../../services/api/unitOfWork-service"
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
} from "@ui-kitten/components"
import { FontAwesome5, AntDesign, EvilIcons } from "@expo/vector-icons"

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
// khai báo mảng
let listDataNguoiPhuTrach = []
let listDataNguonTiemNang = []
let listDataKhuVuc = []
let listDataNhomKhachHang = []
let listGioiTinhDisplay = ["Nam", "Nữ"]
let listGioiTinh = ["NAM", "NU"]
let listNhanVienTakeCare = []
const _unitOfWork = new UnitOfWorkService()

export const StoreKhachHangTienNangScreen = observer(function StoreKhachHangTienNangScreen() {
  const CalendarIcon = (props) => <Icon {...props} name="calendar" />
  const [selectedGioiTinh, setSelectedGioiTinh] = useState(0)
  const [ngayLienHe, setNgayLienHe] = useState(null)
  const [ngaySinh, setNgaySinh] = useState(null)
  const [submit, setSubmit] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const navigation = useNavigation()
  const isFocused = useIsFocused()
  const [checked, setChecked] = useState(true)
  const [checkedClickUpdate, setCheckedClickUpdate] = useState(false)
  const [checkedClickThemNguoiLienHe, setCheckedClickThemNguoiLienHe] = useState(false)
  const [indexNguoiLienHe, setIndexNguoiLienHe] = useState(1)
  const [indexNguoiLienHeUpdate, setIndexNguoiLienHeUpdate] = useState(1)
  // const [checkedDuplicatePhone, setCheckedDuplicatePhone] = useState(true)
  // const [checkedDuplicateEmail, setCheckedDuplicateEmail] = useState(true)
  const [formDataThongTin, setFormDataThongTin] = useState({
    hoVaTenDem: "",
    ten: "",
    sdt: "",
    diaChi: "",
    email: "",
    linkFacebook: "",
    ghiChu: "",
    tinhTrangSalesUpdate: "",
    tinhTrangSauGapKhachHang: "",
    danhGiaCongTy: "",
  })
  const [formDataSelect, setFormDataSelect] = useState({
    selectedNguoiPhuTrach: null,
    selectedNguonTiemNang: null,
    selectedKhuVuc: null,
    selectedNhomKhachHang: null,
    selectedNhanVienTakeCare: null,
  })

  const [formDataThongTinNguoiLienHe, setFormDataThongTinNguoiLienHe] = useState({
    hoVaTen: "",
    sdt: "",
    diaChi: "",
    email: "",
    linkFacebook: "",
    ghiChu: "",
    chucVu: "",
    danhGiaThongTinNguoiLienHe: "",
  })
  const [listNguoiLienHe, setListNguoiLienHe] = useState<any>([])

  const displayNguoiPhuTrach = () => {
    if (formDataSelect.selectedNguoiPhuTrach) {
      return (
        listDataNguoiPhuTrach[formDataSelect.selectedNguoiPhuTrach?.row]?.employeeCode +
        "-" +
        listDataNguoiPhuTrach[formDataSelect.selectedNguoiPhuTrach?.row]?.employeeName
      )
    }
    return ""
  }

  const displayNguonTiemNang = () => {
    if (formDataSelect.selectedNguonTiemNang) {
      return listDataNguonTiemNang[formDataSelect.selectedNguonTiemNang?.row]?.categoryName
    }
    return ""
  }

  const displayKhuVuc = () => {
    if (formDataSelect.selectedKhuVuc) {
      return listDataKhuVuc[formDataSelect.selectedKhuVuc?.row]?.geographicalAreaName
    }
    return ""
  }

  const displayNhomKhacHang = () => {
    if (formDataSelect.selectedNhomKhachHang) {
      return listDataNhomKhachHang[formDataSelect.selectedNhomKhachHang?.row]?.categoryName
    }
    return ""
  }

  const displayNhanVienTakeCare = () => {
    if (formDataSelect.selectedNhanVienTakeCare) {
      return (
        listNhanVienTakeCare[formDataSelect.selectedNhanVienTakeCare?.row]?.employeeCode +
        " - " +
        listNhanVienTakeCare[formDataSelect.selectedNhanVienTakeCare?.row]?.employeeName
      )
    }
    return ""
  }

  //render lựa chọn
  const renderOptionNguoiPhuTrach = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCode + "-" + title?.employeeName} />
  )
  const renderOptionNguonTiemNang = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )
  const renderOptionKhuVuc = (title) => (
    <SelectItem key={title?.geographicalAreaId} title={title?.geographicalAreaName} />
  )
  const renderOptionNhomKhachHang = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )
  const renderOptionNhanVienTakeCare = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCode + "-" + title?.employeeName} />
  )

  const renderListNguoiLienHe = (title) => (
    <View key={title?.Index} style={styles.contenerNguoiLienHe}>
      <View style={styles.contenerNguoiLienHeLeft}>
        <Text style={styles.contenerNguoiLienHeText}>Người liên hệ</Text>
        <Text style={styles.contenerNguoiLienHeText}>Số điện thoại</Text>
        <Text style={styles.contenerNguoiLienHeText}>Giới tính</Text>
        <Text style={styles.contenerNguoiLienHeText}>Chức vụ</Text>
        <Text style={styles.contenerNguoiLienHeText}>Email</Text>
      </View>
      <View style={styles.contenerNguoiLienHeMid}>
        <Text style={styles.contenerNguoiLienHeText}>{title?.FullName}</Text>
        <Text style={styles.contenerNguoiLienHeText}>{title?.Phone}</Text>
        <Text style={styles.contenerNguoiLienHeText}>{title?.GenderDisplay}</Text>
        <Text style={styles.contenerNguoiLienHeText}>{title?.Role}</Text>
        <Text style={styles.contenerNguoiLienHeText}>{title?.Email}</Text>
      </View>
      <View style={styles.contenerNguoiLienHeRight}>
        <TouchableOpacity onPress={() => getUpdateNguoiLienHe(title?.Index)}>
          <View style={styles.buttonUpdate}>
            <EvilIcons name="pencil" size={24} color="white" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteNguoiLienHe(title?.Index)}>
          <View style={styles.buttonDelete}>
            <AntDesign name="delete" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
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
  useEffect(() => {
    fetchData()
  }, [isRefresh, isFocused])
  const fetchData = async () => {
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)
      listDataNguoiPhuTrach = []
      listDataNguonTiemNang = []
      listDataKhuVuc = []
      listDataNhomKhachHang = []
      let payload = {}
      let responseGetDataCreatePotentialCustomer = await _unitOfWork.user.getDataCreatePotentialCustomer(
        payload,
      )
      if (responseGetDataCreatePotentialCustomer.data?.statusCode != 200) {
        goBack(responseGetDataCreatePotentialCustomer.data?.messageCode)
        return
      }
      for (
        let i = 0;
        i < responseGetDataCreatePotentialCustomer?.data.listEmployeeModel.length;
        i++
      ) {
        listDataNguoiPhuTrach.push(
          responseGetDataCreatePotentialCustomer?.data.listEmployeeModel[i],
        )
      }
      for (let i = 0; i < responseGetDataCreatePotentialCustomer?.data.listInvestFund.length; i++) {
        listDataNguonTiemNang.push(responseGetDataCreatePotentialCustomer?.data.listInvestFund[i])
      }
      for (let i = 0; i < responseGetDataCreatePotentialCustomer?.data.listArea.length; i++) {
        listDataKhuVuc.push(responseGetDataCreatePotentialCustomer?.data.listArea[i])
      }
      for (
        let i = 0;
        i < responseGetDataCreatePotentialCustomer?.data.listGroupCustomer.length;
        i++
      ) {
        listDataNhomKhachHang.push(
          responseGetDataCreatePotentialCustomer?.data.listGroupCustomer[i],
        )
      }
      for (
        let i = 0;
        i < responseGetDataCreatePotentialCustomer?.data.listEmployeeTakeCare.length;
        i++
      ) {
        listNhanVienTakeCare.push(
          responseGetDataCreatePotentialCustomer?.data.listEmployeeTakeCare[i],
        )
      }

      setLoading(false)
    }
  }

  const getUpdateNguoiLienHe = (value: number) => {
    setCheckedClickUpdate(true)
    let indexInArray
    listNguoiLienHe.forEach((item, index) => {
      if (item?.Index == value) {
        indexInArray = index
        setIndexNguoiLienHeUpdate(index)
      }
      let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
      _formDataThongTinNguoiLienHe.hoVaTen = listNguoiLienHe[indexInArray]?.FullName
      _formDataThongTinNguoiLienHe.email = listNguoiLienHe[indexInArray]?.Email
      _formDataThongTinNguoiLienHe.linkFacebook = listNguoiLienHe[indexInArray]?.LinkFace
      _formDataThongTinNguoiLienHe.chucVu = listNguoiLienHe[indexInArray]?.Role
      _formDataThongTinNguoiLienHe.sdt = listNguoiLienHe[indexInArray]?.Phone
      ;(_formDataThongTinNguoiLienHe.diaChi = listNguoiLienHe[indexInArray]?.Address),
        (_formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe =
          listNguoiLienHe[indexInArray]?.EvaluateContactPeople),
        setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
      let ngaySinh = new Date(listNguoiLienHe[indexInArray]?.DateOfBirth)
      setNgaySinh(ngaySinh)
      if (listNguoiLienHe[indexInArray]?.Gender === "NAM") {
        setSelectedGioiTinh(0)
      } else {
        setSelectedGioiTinh(1)
      }
    })
  }
  const deleteNguoiLienHe = (value: number) => {
    let indexInArray
    listNguoiLienHe.forEach((item, index) => {
      if (item?.Index == value) {
        indexInArray = index 
      }
    })
    let _listNguoiLienHe = [...listNguoiLienHe]
    const new_arr = _listNguoiLienHe.splice(1, indexInArray)
    setListNguoiLienHe(new_arr)
    let message = "Xóa người liên hệ thành công"
    thongBao(message)
  }
  const postUpdateNguoiLienHe = () => {
    setCheckedClickThemNguoiLienHe(true)
    if (
      formDataThongTinNguoiLienHe.hoVaTen.length === 0 ||
      validateSdt(formDataThongTinNguoiLienHe.sdt) === false ||
      formDataThongTinNguoiLienHe.sdt?.length === 0
    ) {
      return
    }
    let infoNgLienHe = {
      Address: formDataThongTinNguoiLienHe.diaChi,
      ContactId: "00000000-0000-0000-0000-000000000000",
      CreatedById: "00000000-0000-0000-0000-000000000000",
      CreatedDate: new Date(),
      DateOfBirth: ngaySinh,
      DistrictId: null,
      Email: formDataThongTinNguoiLienHe.email,
      EvaluateContactPeople: formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe,
      FirstName: formDataThongTinNguoiLienHe.hoVaTen,
      FullName: formDataThongTinNguoiLienHe.hoVaTen,
      Gender: listGioiTinh[selectedGioiTinh],
      GenderDisplay: listGioiTinhDisplay[selectedGioiTinh],
      Index: listNguoiLienHe[indexNguoiLienHeUpdate]?.Index,
      IsInlandLH: 1,
      LastName: "",
      LinkFace: formDataThongTinNguoiLienHe.linkFacebook,
      ObjectId: "00000000-0000-0000-0000-000000000000",
      Other: "",
      Phone: formDataThongTinNguoiLienHe.sdt,
      ProvinceId: null,
      Role: formDataThongTinNguoiLienHe.chucVu,
      WardId: null,
    }
    let _listNguoiLienHe = [...listNguoiLienHe]
    _listNguoiLienHe[indexNguoiLienHeUpdate] = infoNgLienHe
    setListNguoiLienHe(_listNguoiLienHe)
    let message = "Cập nhật người liên hệ thành công"
    thongBao(message)
    resetThongTinNguoiLienHe()
    setCheckedClickUpdate(false)
    setCheckedClickThemNguoiLienHe(false)
  }
  const validateSdt = (sdt) => {
    if (Number.isNaN(Number(sdt)) === false || sdt.length === 0) {
      return true
    }
    return false
  }
  const goToPage = (page) => {
    navigation && navigation.navigate(page)
  }
  const validateEmail = (email) => {
    const emailRegexp = new RegExp(
      /^[a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1}([a-zA-Z0-9][\-_\.\+\!\#\$\%\&\'\*\/\=\?\^\`\{\|]{0,1})*[a-zA-Z0-9]@[a-zA-Z0-9][-\.]{0,1}([a-zA-Z][-\.]{0,1})*[a-zA-Z0-9]\.[a-zA-Z0-9]{1,}([\.\-]{0,1}[a-zA-Z]){0,}[a-zA-Z0-9]{0,}$/i,
    )
    if (emailRegexp.test(email) === true || email.length === 0) {
      return true
    }
    return false
  }
  const onRefresh = () => {
    setRefresh(true)
  }
  // const checkDuplicateInforCustomerPhone = async () => {
  //   let payloadCheckDuplicateInforCustomer = {
  //     CheckType:2,
  //     CustomerId:null,
  //     Email: null,
  //     phone:formDataThongTin.sdt
  //   }
  //   let responseCheckDuplicateInforCustomer = await _unitOfWork.user.checkDuplicateInforCustomer(payloadCheckDuplicateInforCustomer)
  //   console.log(responseCheckDuplicateInforCustomer.data)
  //   if (responseCheckDuplicateInforCustomer.data?.statusCode != 200) {
  //     setCheckedDuplicatePhone(false)
  //   }
  //   setCheckedDuplicatePhone(true)
  // }

  // const checkDuplicateInforCustomerEmail = async () => {
  //   let payloadCheckDuplicateInforCustomer = {
  //     CheckType:1,
  //     CustomerId:null,
  //     Email: formDataThongTin.email,
  //     phone:formDataThongTin.sdt
  //   }
  //   let responseCheckDuplicateInforCustomer = await _unitOfWork.user.checkDuplicateInforCustomer(payloadCheckDuplicateInforCustomer)
  //   console.log(responseCheckDuplicateInforCustomer.data)
  //   if (responseCheckDuplicateInforCustomer.data?.statusCode != 200) {
  //     setCheckedDuplicateEmail(false)
  //   }
  //   setCheckedDuplicateEmail(true)
  // }
  const thoat = () => {
    Alert.alert("Thông báo", "Hành động này không thể được hoàn tác, bạn có chắc chắn muốn huỷ?", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ])
  }

  const resetThongTinNguoiLienHe = () => {
    let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
    _formDataThongTinNguoiLienHe.hoVaTen = ""
    _formDataThongTinNguoiLienHe.sdt = ""
    _formDataThongTinNguoiLienHe.email = ""
    ;(_formDataThongTinNguoiLienHe.diaChi = ""), (_formDataThongTinNguoiLienHe.linkFacebook = "")
    _formDataThongTinNguoiLienHe.ghiChu = ""
    _formDataThongTinNguoiLienHe.chucVu = ""
    _formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe = ""
    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
    setNgaySinh(null)
  }

  const resetData = () => {
    setSubmit(false)
    let _formDataThongTin = { ...formDataThongTin }
    _formDataThongTin.hoVaTenDem = ""
    _formDataThongTin.ten = ""
    _formDataThongTin.sdt = ""
    _formDataThongTin.email = ""
    _formDataThongTin.diaChi = ""
    _formDataThongTin.linkFacebook = ""
    _formDataThongTin.ghiChu = ""
    _formDataThongTin.tinhTrangSalesUpdate = ""
    _formDataThongTin.tinhTrangSauGapKhachHang = ""
    _formDataThongTin.danhGiaCongTy = ""
    setFormDataThongTin(_formDataThongTin)
    let _formDataSelect = { ...formDataSelect }
    _formDataSelect.selectedNguoiPhuTrach = null
    _formDataSelect.selectedNguonTiemNang = null
    _formDataSelect.selectedKhuVuc = null
    _formDataSelect.selectedNhomKhachHang = null
    _formDataSelect.selectedNhanVienTakeCare = null
    setFormDataSelect(_formDataSelect)
    resetThongTinNguoiLienHe()
    setNgayLienHe(null)
    console.log(_formDataThongTin)
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

  const luu = async (test) => {
    setSubmit(true)
    setRefresh(false)
    if (isFocused && !isRefresh) {
      setLoading(true)
      if (
        checked === false
          ? validateEmail(formDataThongTin.email) === false ||
            validateSdt(formDataThongTin.sdt) === false ||
            formDataThongTin?.ten?.length === 0 ||
            formDataSelect.selectedNguoiPhuTrach === null ||
            formDataSelect.selectedNguonTiemNang === null
          : validateEmail(formDataThongTin.email) === false ||
            validateEmail(formDataThongTinNguoiLienHe.email) === false ||
            validateSdt(formDataThongTin.sdt) === false ||
            validateSdt(formDataThongTinNguoiLienHe.sdt) === false ||
            formDataSelect.selectedNguoiPhuTrach === null ||
            formDataThongTin?.hoVaTenDem?.length === 0 ||
            formDataSelect.selectedNguonTiemNang === null
      ) {
        let message = "Bạn cần điền đúng form và đủ các trường cần thiết"
        thongBao(message)
      } else {
        const userInfo = await _unitOfWork.user.getUserEmployeeId()
        let payloadCreateCustomer = {
          Contact: {
            Active: true,
            Address: formDataThongTin.diaChi,
            CompanyAddress: "",
            CompanyName: "",
            ContactId: "00000000-0000-0000-0000-000000000000",
            CreatedById: "00000000-0000-0000-0000-000000000000",
            createDate: new Date(),
            DistrictId: null,
            Email: formDataThongTin.email,
            FirstName: formDataThongTin.hoVaTenDem,
            Gender: "",
            GeographicalAreaId:
              listDataKhuVuc[formDataSelect?.selectedKhuVuc?.row]?.geographicalAreaId,
            IdentityID: "",
            Index: 0,
            IsInlandLH: 1,
            LastName: formDataThongTin.ten,
            MaritalStatusId: null,
            Note: formDataThongTin.ghiChu,
            ObjectId: "00000000-0000-0000-0000-000000000000",
            ObjectType: "",
            OptionPosition: "",
            Phone: formDataThongTin.sdt,
            ProvinceId: null,
            SocialUrl: formDataThongTin.linkFacebook,
            WardId: null,
          },
          CreateByLead: false,
          Customer: {
            Active: true,
            BusinessRegistrationDate: null,
            BusinessScale: null,
            BusinessType: null,
            ContactDate: ngayLienHe,
            CreatedById: userInfo.userId,
            CreatedDate: new Date(),
            CustomerCareStaff: null,
            CustomerCode: "",
            CustomerGroupId:
              listDataNhomKhachHang[formDataSelect?.selectedNhomKhachHang?.row]?.categoryId,
            CustomerId: "00000000-0000-0000-0000-000000000000",
            CustomerName:
              formDataThongTin?.ten?.length > 0
                ? formDataThongTin.hoVaTenDem + " " + formDataThongTin.ten
                : formDataThongTin.hoVaTenDem,
            CustomerServiceLevelId: null,
            CustomerType: checked === false ? 2 : 1,
            EmployeeTakeCareId:
              checked === false
                ? "00000000-0000-0000-0000-000000000000"
                : listNhanVienTakeCare[formDataSelect?.selectedNhanVienTakeCare?.row]?.employeeId,
            EnterpriseType: null,
            EvaluateCompany: formDataThongTin.danhGiaCongTy,
            FieldId: null,
            InvestmentFundId:
              listDataNguonTiemNang[formDataSelect?.selectedNguonTiemNang?.row]?.categoryId,
            KhachDuAn: false,
            LeadId: null,
            MaximumDebtDays: null,
            MaximumDebtValue: null,
            NearestDateTransaction: null,
            PaymentId: null,
            PersonInChargeId:
              listDataNguoiPhuTrach[formDataSelect?.selectedNguoiPhuTrach?.row]?.employeeId,
            SalesUpdate: formDataThongTin.tinhTrangSalesUpdate,
            SalesUpdateAfterMeeting: formDataThongTin.tinhTrangSauGapKhachHang,
            ScaleId: null,
            StatusId: "00000000-0000-0000-0000-000000000000",
            TotalCapital: 0,
            TotalEmployeeParticipateSocialInsurance: null,
            TotalReceivable: 0,
            TotalRevenueLastYear: null,
            TotalSaleValue: 0,
          },
          CustomerContactList: checked === false ? [] : listNguoiLienHe,
          IsFromLead: true,
        }

        let responseCreateCustomer = await _unitOfWork.user.createCustomer(payloadCreateCustomer)
        if (responseCreateCustomer.data?.statusCode != 200) {
          goBack(responseCreateCustomer.data?.messageCode)
          return
        }
        Alert.alert(
          "Thông báo",
          responseCreateCustomer.data?.messageCode,
          [
            {
              text: "OK",
            },
          ],
          { cancelable: false },
        )
        if (Number(test) === 1) {
          goToPage("ListKhachHangTienNangScreen")
        }
        setSubmit(false)
        resetData()
      }

      setLoading(false)
    }
  }
  const headerButtonLienHe = () => {
    return (
      <View style={styles.headerButton2}>
        <Button
          style={styles.button11}
          onPress={() => {
            setCheckedClickUpdate(false),
              resetThongTinNguoiLienHe(),
              setCheckedClickUpdate(false),
              setCheckedClickThemNguoiLienHe(false)
          }}
        >
          Hủy
        </Button>
        <Button
          style={styles.button2}
          onPress={() => {
            postUpdateNguoiLienHe()
          }}
        >
          Cập nhật liên hệ
        </Button>
      </View>
    )
  }
  const themNguoiLienHe = () => {
    let message = ""

    setCheckedClickThemNguoiLienHe(true)
    if (
      formDataThongTinNguoiLienHe.hoVaTen.length === 0 ||
      validateSdt(formDataThongTinNguoiLienHe.sdt) === false ||
      formDataThongTinNguoiLienHe.sdt?.length === 0
    ) {
      return
    }
    listNguoiLienHe.forEach((item) => {
      if (item?.Phone == formDataThongTinNguoiLienHe.sdt) {
        message = "Số điện thoại đã tồn tại"
        thongBao(message)
      }
    })

    if (message.length > 0) {
      return
    }
    let thongTinNguoiLienHe = {
      Address: formDataThongTinNguoiLienHe.diaChi,
      ContactId: "00000000-0000-0000-0000-000000000000",
      CreatedById: "00000000-0000-0000-0000-000000000000",
      CreatedDate: new Date(),
      DateOfBirth: ngaySinh,
      DistrictId: null,
      Email: formDataThongTinNguoiLienHe.email,
      EvaluateContactPeople: formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe,
      FirstName: formDataThongTinNguoiLienHe.hoVaTen,
      FullName: formDataThongTinNguoiLienHe.hoVaTen,
      Gender: listGioiTinh[selectedGioiTinh],
      GenderDisplay: listGioiTinhDisplay[selectedGioiTinh],
      IsInlandLH: 1,
      Index: indexNguoiLienHe,
      LastName: "",
      LinkFace: formDataThongTinNguoiLienHe.linkFacebook,
      ObjectId: "00000000-0000-0000-0000-000000000000",
      Other: "",
      Phone: formDataThongTinNguoiLienHe.sdt,
      ProvinceId: null,
      Role: formDataThongTinNguoiLienHe.chucVu,
      WardId: null,
    }

    setIndexNguoiLienHe(indexNguoiLienHe + 1)
    let _listNguoiLienHe = [...listNguoiLienHe]
    _listNguoiLienHe.push(thongTinNguoiLienHe)
    setListNguoiLienHe(_listNguoiLienHe)
    message = "Thêm người liên hệ thành công"
    thongBao(message)
    resetThongTinNguoiLienHe()
    setCheckedClickThemNguoiLienHe(false)
  }

  const topComponent = () => {
    return (


      <View style={{ flex: 1 }}>
        <View style={styles.headerButton}>
          <Button style={styles.button1} onPress={thoat}>
            Thoát
          </Button>
          <Button
            style={styles.button2}
            onPress={() => {
              luu(2)
            }}
          >
            Lưu và thêm tạo mới
          </Button>
          <Button
            style={styles.button1}
            onPress={() => {
              luu(1)
            }}
          >
            Lưu
          </Button>
        </View>
        <View
          style={{
            backgroundColor: color.palette.white,
            padding: 16,
            marginTop: 6,
          }}
        >
          <Text style={styles.contenerTextHeader}>
            <FontAwesome5 name="chevron-circle-down" size={17} color="black" /> Thông tin
          </Text>
          <View style={styles.contenerRadio}>
            <Radio
              style={{ marginBottom: 6 }}
              checked={checked}
              onChange={() => {
                setChecked(true), resetData()
              }}
            >
              Doanh nghiệp
            </Radio>
            <Radio
              style={{ marginBottom: 6 }}
              checked={!checked}
              onChange={() => {
                setChecked(false), resetData()
              }}
            >
              Cá nhân
            </Radio>
          </View>
          {checked == false ? (
            <View style={styles.contenerBoody}>
              <Text style={styles.contenerTextBoody}>Họ và tên đệm</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.hoVaTenDem = text), setFormDataThongTin(_formDataThongTin)
                }}
              ></Input>
              <Text style={styles.contenerTextBoody}>Tên*</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ten = text), setFormDataThongTin(_formDataThongTin)
                }}
                status={formDataThongTin?.ten?.length === 0 && submit === true ? "danger" : "basic"}
              ></Input>
              <Text style={styles.contenerTextBoody}>Số điện thoại</Text>
              <Input
                keyboardType="numeric"
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.sdt = text), setFormDataThongTin(_formDataThongTin)
                  // checkDuplicateInforCustomerPhone()
                }}
                status={validateSdt(formDataThongTin.sdt) === false ? "danger" : "basic"}
              ></Input>
              <Text style={styles.contenerTextBoody}>Địa chỉ</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
                }}
              ></Input>
              <Text style={styles.contenerTextBoody}>Người phụ trách*</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn người phụ trách"
                  value={displayNguoiPhuTrach()}
                  selectedIndex={formDataSelect.selectedNguoiPhuTrach}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNguoiPhuTrach = index
                    setFormDataSelect(_formDataSelect)
                  }}
                  status={
                    formDataSelect.selectedNguoiPhuTrach === null && submit === true
                      ? "danger"
                      : "basic"
                  }
                >
                  {listDataNguoiPhuTrach.map(renderOptionNguoiPhuTrach)}
                </Select>
              </Layout>
              <Text style={styles.contenerTextBoody}>Email</Text>
              <Input
                keyboardType="email-address"
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.email = text), setFormDataThongTin(_formDataThongTin)
                  // checkDuplicateInforCustomerEmail()
                }}
                status={validateEmail(formDataThongTin.email) === false ? "danger" : "basic"}
              ></Input>
              <Text style={styles.contenerTextBoody}>Link facebook</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.linkFacebook = text), setFormDataThongTin(_formDataThongTin)
                }}
              ></Input>
              <Text style={styles.contenerTextBoody}>Nguồn tiềm năng*</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn nguồn tiềm năng"
                  value={displayNguonTiemNang()}
                  selectedIndex={formDataSelect.selectedNguonTiemNang}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNguonTiemNang = index
                    setFormDataSelect(_formDataSelect)
                  }}
                  status={
                    formDataSelect.selectedNguonTiemNang === null && submit === true
                      ? "danger"
                      : "basic"
                  }
                >
                  {listDataNguonTiemNang.map(renderOptionNguonTiemNang)}
                </Select>
              </Layout>
              <Text style={styles.contenerTextBoody}>Khu vực</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn khu vực"
                  value={displayKhuVuc()}
                  selectedIndex={formDataSelect.selectedKhuVuc}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedKhuVuc = index
                    setFormDataSelect(_formDataSelect)
                  }}
                >
                  {listDataKhuVuc.map(renderOptionKhuVuc)}
                </Select>
              </Layout>
              <Text style={styles.contenerTextBoody}>Nhóm khách hàng</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn nhóm khách hàng"
                  value={displayNhomKhacHang()}
                  selectedIndex={formDataSelect.selectedNhomKhachHang}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNhomKhachHang = index
                    setFormDataSelect(_formDataSelect)
                  }}
                >
                  {listDataNhomKhachHang.map(renderOptionNhomKhachHang)}
                </Select>
              </Layout>
              <Text style={styles.contenerTextBoody}>Ghi chú</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                // value={}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>
            </View>
          ) : (
            // doanh nghiệp
            <View>
              <Text style={styles.contenerTextBoody}>Tên công ty*</Text>
              <Input
                value={formDataThongTin?.hoVaTenDem}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.hoVaTenDem = text), setFormDataThongTin(_formDataThongTin)
                }}
                status={
                  formDataThongTin?.hoVaTenDem?.length === 0 && submit === true ? "danger" : "basic"
                }
              />

              <Text style={styles.contenerTextBoody}>Ngày liên hệ</Text>
              {/* <Layout level="1">
                <Datepicker
                  placeholder="Chọn ngày liên hệ"
                  date={ngayLienHe}
                  onSelect={(nextDate) => setNgayLienHe(nextDate)}
                  accessoryRight={CalendarIcon}
                />
              </Layout> */}
                            <DatePicker
              style={styles.stylesForDate}
                locale={"vi"}
                display="spinner"
                showIcon={false}
                mode="date"
                placeholder="Ngày liên hệ"
                format="DD/MM/YYYY"
                minDate={new Date()}
                confirmBtnText="Xác nhận"
                cancelBtnText="Huỷ"
                date={ngayLienHe}
                onDateChange={(date) => {
                  let _arr = date.split("/")
                  let d = new Date(_arr[2], _arr[1] - 1, _arr[0], 7, 0, 0)
                  setNgayLienHe(d)
                }}
                iOSDatePickerComponent={(props) => (
                  <RNDatePicker
                    {...props}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                  />
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

              <Text style={styles.contenerTextBoody}>Người phụ trách*</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn người phụ trách"
                  value={displayNguoiPhuTrach()}
                  selectedIndex={formDataSelect.selectedNguoiPhuTrach}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNguoiPhuTrach = index
                    setFormDataSelect(_formDataSelect)
                  }}
                  status={
                    formDataSelect.selectedNguoiPhuTrach === null && submit === true
                      ? "danger"
                      : "basic"
                  }
                >
                  {listDataNguoiPhuTrach.map(renderOptionNguoiPhuTrach)}
                </Select>
              </Layout>
              <Text style={styles.contenerTextBoody}>Nguồn tiềm năng*</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn nguồn tiềm năng"
                  value={displayNguonTiemNang()}
                  selectedIndex={formDataSelect.selectedNguonTiemNang}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNguonTiemNang = index
                    setFormDataSelect(_formDataSelect)
                  }}
                  status={
                    formDataSelect.selectedNguonTiemNang === null && submit === true
                      ? "danger"
                      : "basic"
                  }
                >
                  {listDataNguonTiemNang.map(renderOptionNguonTiemNang)}
                </Select>
              </Layout>

              <Text style={styles.contenerTextBoody}>Tình trạng (Sales update)</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                // value={}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Tình trạng sau gặp khách hàng</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                // value={}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Số điện thoại</Text>
              <Input
                keyboardType="numeric"
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.sdt = text), setFormDataThongTin(_formDataThongTin)
                  // checkDuplicateInforCustomerPhone()
                }}
                status={validateSdt(formDataThongTin.sdt) === false ? "danger" : "basic"}
              ></Input>

              <Text style={styles.contenerTextBoody}>Khu vực</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn khu vực"
                  value={displayKhuVuc()}
                  selectedIndex={formDataSelect.selectedKhuVuc}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedKhuVuc = index
                    setFormDataSelect(_formDataSelect)
                  }}
                >
                  {listDataKhuVuc.map(renderOptionKhuVuc)}
                </Select>
              </Layout>

              <Text style={styles.contenerTextBoody}>Link facebook</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.linkFacebook = text), setFormDataThongTin(_formDataThongTin)
                }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Nhân viên take care</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn nhân viên take care"
                  value={displayNhanVienTakeCare()}
                  selectedIndex={formDataSelect.selectedNhanVienTakeCare}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNhanVienTakeCare = index
                    setFormDataSelect(_formDataSelect)
                  }}
                >
                  {listNhanVienTakeCare.map(renderOptionNhanVienTakeCare)}
                </Select>
              </Layout>

              <Text style={styles.contenerTextBoody}>Nhóm khách hàng</Text>
              <Layout level="1">
                <Select
                  style={styles.select}
                  placeholder="Chọn nhóm khách hàng"
                  value={displayNhomKhacHang()}
                  selectedIndex={formDataSelect.selectedNhomKhachHang}
                  onSelect={(index) => {
                    let _formDataSelect = { ...formDataSelect }
                    _formDataSelect.selectedNhomKhachHang = index
                    setFormDataSelect(_formDataSelect)
                  }}
                >
                  {listDataNhomKhachHang.map(renderOptionNhomKhachHang)}
                </Select>
              </Layout>

              <Text style={styles.contenerTextBoody}>Đánh giá công ty</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                // value={}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Ghi chú</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                // value={}
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Email</Text>
              <Input
                keyboardType="email-address"
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.email = text), setFormDataThongTin(_formDataThongTin)
                  // checkDuplicateInforCustomerEmail()
                }}
                status={validateEmail(formDataThongTin.email) === false ? "danger" : "basic"}
              ></Input>

              <Text style={styles.contenerTextBoody}>Địa chỉ</Text>
              <Input
                onChangeText={(text) => {
                  let _formDataThongTin = { ...formDataThongTin }
                  ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
                }}
              ></Input>
              <View style={{ marginBottom: 16 }} />

              <Text style={styles.contenerTextHeader}>Thông tin người liên hệ</Text>
              {checkedClickUpdate === false ? (
                <Button onPress={() => themNguoiLienHe()}>Thêm người liên hệ</Button>
              ) : (
                headerButtonLienHe()
              )}

              <Text style={styles.contenerTextBoody}>Họ và tên*</Text>
              <Input
                value={formDataThongTinNguoiLienHe.hoVaTen}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  _formDataThongTinNguoiLienHe.hoVaTen = text
                  setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
                status={
                  checkedClickThemNguoiLienHe === true &&
                  formDataThongTinNguoiLienHe.hoVaTen.length === 0
                    ? "danger"
                    : "basic"
                }
              ></Input>

              <Text style={styles.contenerTextBoody}>Số điện thoại*</Text>
              <Input
                keyboardType="numeric"
                value={formDataThongTinNguoiLienHe.sdt}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.sdt = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
                status={
                  validateSdt(formDataThongTinNguoiLienHe.sdt) === false ||
                  (formDataThongTinNguoiLienHe.sdt?.length === 0 &&
                    checkedClickThemNguoiLienHe === true)
                    ? "danger"
                    : "basic"
                }
              ></Input>

              <Text style={styles.contenerTextBoody}>Email</Text>
              <Input
                keyboardType="email-address"
                value={formDataThongTinNguoiLienHe.email}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.email = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
                status={
                  validateEmail(formDataThongTinNguoiLienHe.email) === false ? "danger" : "basic"
                }
              ></Input>

              <Text style={styles.contenerTextBoody}>Link facebook</Text>
              <Input
                value={formDataThongTinNguoiLienHe.linkFacebook}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.linkFacebook = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
              ></Input>

              <Text>Chức vụ</Text>
              <Input
                value={formDataThongTinNguoiLienHe.chucVu}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.chucVu = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Ngày sinh</Text>
              {/* <Layout level="1">
                <Datepicker
                  placeholder="Chọn ngày sinh"
                  date={ngaySinh}
                  onSelect={(nextDate) => setNgaySinh(nextDate)}
                  accessoryRight={CalendarIcon}
                />
              </Layout> */}

              <DatePicker
              style={styles.stylesForDate}
                locale={"vi"}
                display="spinner"
                showIcon={false}
                mode="date"
                placeholder="Ngày sinh"
                format="DD/MM/YYYY"
                minDate="01/01/1920"
                maxDate={new Date()}
                confirmBtnText="Xác nhận"
                cancelBtnText="Huỷ"
                date={ngaySinh}
                onDateChange={(date) => {
                  let _arr = date.split("/")
                  let d = new Date(_arr[2], _arr[1] - 1, _arr[0], 7, 0, 0)
                  setNgaySinh(d)
                }}
                iOSDatePickerComponent={(props) => (
                  <RNDatePicker
                    {...props}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                  />
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


              <Text style={styles.contenerTextBoody}>Giới tính</Text>
              <RadioGroup
                selectedIndex={selectedGioiTinh}
                onChange={(index) => setSelectedGioiTinh(index)}
              >
                <Radio>Nam</Radio>
                <Radio>Nữ</Radio>
              </RadioGroup>
              <Text style={styles.contenerTextBoody}>Địa chỉ</Text>
              <Input
                value={formDataThongTinNguoiLienHe.diaChi}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.diaChi = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
              ></Input>

              <Text style={styles.contenerTextBoody}>Đánh giá thông tin người liên hệ</Text>
              <Input
                multiline={true}
                style={styles.inputMul}
                value={formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe}
                onChangeText={(text) => {
                  let _formDataThongTinNguoiLienHe = { ...formDataThongTinNguoiLienHe }
                  ;(_formDataThongTinNguoiLienHe.danhGiaThongTinNguoiLienHe = text),
                    setFormDataThongTinNguoiLienHe(_formDataThongTinNguoiLienHe)
                  // checkDuplicateInforCustomerEmail()
                }}
                textStyle={{ minHeight: 64 }}
              ></Input>
              {listNguoiLienHe.length > 0 && (
                <View style={styles.thongTinLienHe}>
                  <Text style={styles.contenerTextHeader}>Danh sách người liên hệ</Text>
                  {listNguoiLienHe.map(renderListNguoiLienHe)}
                </View>
              )}
            </View>
          )}
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
    marginTop: 6,
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
  stylesForDate:{
    borderWidth:1,
    width:"100%", 
    paddingLeft:6,
    borderRadius:5,
    backgroundColor:"rgb(247, 249, 252)",
    borderColor:"rgb(228, 233, 242)"
  }
})
