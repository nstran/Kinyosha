import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native"
import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle, ScrollView } from "react-native"
import { Header, Loading, Screen } from "../../components"
import { useNavigation, useRoute } from "@react-navigation/native"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { useStores } from "../../models"
import RNDatePicker from "@react-native-community/datetimepicker"
import DatePicker from "react-native-datepicker"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import {
  Button,
  Input,
  SelectItem,
  Select,
  Layout,
  IndexPath,
  Datepicker,
  Icon,
} from "@ui-kitten/components"
var dataDeXuatCho = []

var data = []

var dataCa = []

var dataNguoiPheDuyet = []

var dataThongBaoCho = []

const _unitOfWork = new UnitOfWorkService()

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

const HEADER: TextStyle = {
  paddingBottom: spacing[5] - 1,
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

const CalendarIcon = (props) => <Icon {...props} name="calendar" />
export const TaoDeXuatXinNghiScreen = observer(function TaoDeXuatXinNghiScreen() {
  const router: any = useRoute()
  const params = router.params
  const [isSubmit, setSubmit] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const navigation = useNavigation()
  const [date, setDate] = useState(new Date())
  const [date2, setDate2] = useState(new Date())
  const [createDate, setCreateDate] = useState(new Date())
  // Pull in one of our MST stores
  const [selectedDeXuatCho, setSelectedDeXuatCho] = useState(new IndexPath(0))
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0))
  const [selectedCa1, setSelectedCa1] = useState(new IndexPath(0))
  const [selectedCa2, setSelectedCa2] = useState(new IndexPath(0))
  const [selectedNguoiPheDuyet, setSelectedNguoiPheDuyet] = useState(new IndexPath(0))
  const [selectedNguoiThongBao, setSelectedNguoiThongBao] = useState([new IndexPath(0)])
  const [lyDoNghi, setLyDoNghi] = useState(null)
  const [trangThai, setTrangThai] = useState("")
  const [maPhieu, setMaPhieu] = useState("")
  const [nameNguoiTao, setNameNguoiTao] = useState("")
  const [codeNguoiTao, setCodeNguoiTao] = useState("")
  const [checkSua, setCheckSua] = useState(false)
  const [statusId, setStatusId] = useState("")
  const [shiftName, setShiftName] = useState("")

  // const [formData, setFormData] = useState({
  //   nguoiGui: "",
  //   nguoiPheDuyet: ''
  // })
  // const [selsectIndex, setSelectindex] = useState({
  //   selectedCa1: new IndexPath(0),
  //   selectedCa2: new IndexPath(0),
  // })

  // khai b??o gi?? tr??? ????? t??nh ca(s??ng,chi???u t???i)
  var valueCa = "0"
  var isValidate = false // ???? validate hay ch??a
  // format date
  function formatDate(date) {
    return date?.getDate() + "/" + (parseInt(date?.getMonth()) + 1) + "/" + date?.getFullYear()
  }
  // t??nh ng??y ngh???
  function tinhNgayNghi() {
    var ca = 0
    if (date > date2) {
      valueCa = "0"
      isValidate = false
      return diffDays
    }

    if (
      dataCa[parseInt(selectedCa1.row)]?.categoryName === "S??ng" &&
      dataCa[parseInt(selectedCa2.row)]?.categoryName === "S??ng"
    ) {
      ca = 0.5
    }
    if (
      dataCa[parseInt(selectedCa1.row)]?.categoryName === "S??ng" &&
      (dataCa[parseInt(selectedCa2.row)]?.categoryName === "Chi???u" ||
        dataCa[parseInt(selectedCa2.row)]?.categoryName === "T???i")
    ) {
      ca = 1
    }
    if (
      date === date2 &&
      (dataCa[parseInt(selectedCa1.row)]?.categoryName === "Chi???u" ||
        dataCa[parseInt(selectedCa1.row)]?.categoryName === "T???i") &&
      dataCa[parseInt(selectedCa2.row)]?.categoryName === "S??ng"
    ) {
      ca = -0.5
    }
    if (
      (dataCa[parseInt(selectedCa1.row)]?.categoryName === "Chi???u" ||
        dataCa[parseInt(selectedCa1.row)]?.categoryName === "T???i") &&
      (dataCa[parseInt(selectedCa2.row)]?.categoryName === "Chi???u" ||
        dataCa[parseInt(selectedCa2.row)]?.categoryName === "T???i")
    ) {
      ca = 0.5
    }
    var timeDiff = Math.abs(date.getTime() - date2.getTime())
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24))
    var valueCaInt = diffDays + ca
    if (valueCaInt < 0) {
      valueCa = "0"
      isValidate = false
      return valueCa
    }
    valueCa = valueCaInt.toString()
    isValidate = true
    return valueCa
  }
  // ch???y function t??nh ng??y ngh???
  tinhNgayNghi()

  useEffect(() => {
    fetchData()
  }, [isRefresh])
  //l???y data
  const fetchData = async () => {
    setRefresh(false)
    setLoading(true)
    dataDeXuatCho = []

    data = []

    dataCa = []

    dataNguoiPheDuyet = []

    dataThongBaoCho = []
    if (!isRefresh) {
      //l???y danh s??ch ????? xu???t cho(get all employee)
      let payload = {}
      let responsegetAllEmployee = await _unitOfWork.user.getAllEmployee(payload)
      for (var i = 0; i < responsegetAllEmployee?.data.employeeList.length; i++) {
        dataDeXuatCho.push(responsegetAllEmployee?.data.employeeList[i])
      }
      // l???y danh s??ch lo???i ????? xu???t
      let payloadLoaiDeXuat = {
        CategoryTypeCode: "LXU",
      }
      let responseLoaiDeXuat = await _unitOfWork.user.getAllCategoryByCategoryTypeCode(
        payloadLoaiDeXuat,
      )
      if (responseLoaiDeXuat?.data.statusCode != 200) {
        goBack(responseLoaiDeXuat?.data.messageCode)
        return
      }
      for (var i = 0; i < responseLoaiDeXuat?.data.category.length; i++) {
        data.push(responseLoaiDeXuat?.data.category[i])
      }

      // l???y danh s??ch lo???i c??c ca s??ng chi???u t???i
      let payloadCa = {
        CategoryTypeCode: "CVI",
      }
      let responseCa = await _unitOfWork.user.getAllCategoryByCategoryTypeCode(payloadCa)
      if (responseCa.data?.statusCode != 200) {
        goBack(responseCa.data?.messageCode)
        return
      }
      for (var i = 0; i < responseCa?.data.category.length; i++) {
        dataCa.push(responseCa?.data.category[i])
      }
      // n???u c?? id v?? ch??a click v??o s???a
      if (params?.id !== undefined && checkSua === false) {
        // GetEmployeeRequestById
        let payloadGetEmployeeRequestById = {
          EmployeeRequestId: params?.id,
        }
        let responseGetEmployeeRequestById = await _unitOfWork.user.getEmployeeRequestById(
          payloadGetEmployeeRequestById,
        )
        if (responseGetEmployeeRequestById.data?.statusCode != 200) {
          goBack(responseGetEmployeeRequestById.data?.messageCode)
          return
        }
        setShiftName(responseGetEmployeeRequestById.data?.employeeRequest.shiftName)
        setStatusId(responseGetEmployeeRequestById.data?.employeeRequest.statusId)
        setTrangThai(responseGetEmployeeRequestById.data?.statusName)
        setMaPhieu(responseGetEmployeeRequestById.data?.employeeRequest.employeeRequestCode)

        setNameNguoiTao(responseGetEmployeeRequestById.data?.employeeRequest.createEmployeeCode)
        var dateCreate = new Date(responseGetEmployeeRequestById.data?.employeeRequest.createDate)
        setCreateDate(dateCreate)
        var dateStartDate = new Date(responseGetEmployeeRequestById.data?.employeeRequest.startDate)
        setDate(dateStartDate)
        var dateEndDate = new Date(responseGetEmployeeRequestById.data?.employeeRequest.createDate)
        setDate2(dateEndDate)

        let indexemployeeId = new IndexPath(0)
        // set data ????? xu???t cho
        dataDeXuatCho.forEach((item, index) => {
          if (
            item.employeeId === responseGetEmployeeRequestById.data?.employeeRequest.offerEmployeeId
          ) {
            indexemployeeId = new IndexPath(index)
            setSelectedDeXuatCho(indexemployeeId)
          }
        })

        let employeeId1 = dataDeXuatCho[indexemployeeId.row]?.employeeId
        let payloadEmployeeApprove = {
          ModuleCode: "EMP_REQUEST",
          employeeId: employeeId1,
        }
        let responseEmployeeApprove = await _unitOfWork.user.getEmployeeApprove(
          payloadEmployeeApprove,
        )
        if (responseEmployeeApprove.data?.statusCode != 200) {
          goBack(responseEmployeeApprove.data?.messageCode)
          return
        }
        // l???y data ng?????i ph?? duy???t
        for (var i = 0; i < responseEmployeeApprove.data.listEmployeeToApprove.length; i++) {
          dataNguoiPheDuyet.push(responseEmployeeApprove.data.listEmployeeToApprove[i])
        }
        // l???y data ng?????i th??ng b??o cho
        for (var i = 0; i < responseEmployeeApprove.data.listEmployeeToNotify.length; i++) {
          dataThongBaoCho.push(responseEmployeeApprove.data.listEmployeeToNotify[i])
        }

        //lo???i ????? xu???t
        data.forEach((item, index) => {
          if (
            item.categoryId === responseGetEmployeeRequestById.data?.employeeRequest.typeRequest
          ) {
            let indexData = new IndexPath(index)
            setSelectedIndex(indexData)
          }
        })
        //lo???i ca b???t ?????u t???
        dataCa.forEach((item, index) => {
          if (
            item.categoryId === responseGetEmployeeRequestById.data?.employeeRequest.startTypeTime
          ) {
            let indexData = new IndexPath(index)
            setSelectedCa1(indexData)
          }
        })
        //lo???i ca ?????n
        dataCa.forEach((item, index) => {
          if (
            item.categoryId === responseGetEmployeeRequestById.data?.employeeRequest.endTypeTime
          ) {
            let indexData = new IndexPath(index)
            setSelectedCa2(indexData)
          }
        })
        // l?? do ngh???
        setLyDoNghi(responseGetEmployeeRequestById.data?.employeeRequest.detail)
        dataNguoiPheDuyet.forEach((item, index) => {
          if (item.employeeId === responseGetEmployeeRequestById.data?.employeeRequest.approverId) {
            if (index !== undefined) {
              let indexData = new IndexPath(index)
              setSelectedNguoiPheDuyet(indexData)
            }
          }
        })
        //set data th??ng b??o cho t??? d??? li???u get v???
        let dataThongBaoChoTest = []
        dataThongBaoCho.forEach((item, index) => {
          if (
            responseGetEmployeeRequestById.data?.employeeRequest.notifyList.includes(
              item.employeeId,
            )
          ) {
            let indexData = new IndexPath(index)
            dataThongBaoChoTest.push(indexData)
            // setSelectedNguoiThongBao(indexData)
          }
        })
        setSelectedNguoiThongBao(dataThongBaoChoTest)
        setNameNguoiTao(
          responsegetAllEmployee.data.employeeList.find(
            (el) => String(el.employeeId) === employeeId1,
          )?.employeeCodeName,
        )
        console.log(nameNguoiTao)
        setCodeNguoiTao(
          responsegetAllEmployee.data.employeeList.find(
            (el) => String(el.employeeId) === employeeId1,
          )?.employeeCode,
        )
      } else {
        // d??nh cho t???o ????? xu???t xin ngh??? v?? khi ch???nh x???a d??? li???u
        setCheckSua(true)
        let employeeId1 = dataDeXuatCho[selectedDeXuatCho.row]?.employeeId
        let payloadEmployeeApprove = {
          ModuleCode: "EMP_REQUEST",
          employeeId: employeeId1,
        }
        let responseEmployeeApprove = await _unitOfWork.user.getEmployeeApprove(
          payloadEmployeeApprove,
        )
        if (responseEmployeeApprove.data?.statusCode != 200) {
          goBack(responseEmployeeApprove.data?.messageCode)
          return
        }
        for (var i = 0; i < responseEmployeeApprove.data.listEmployeeToApprove.length; i++) {
          dataNguoiPheDuyet.push(responseEmployeeApprove.data.listEmployeeToApprove[i])
        }
        for (var i = 0; i < responseEmployeeApprove.data.listEmployeeToNotify.length; i++) {
          dataThongBaoCho.push(responseEmployeeApprove.data.listEmployeeToNotify[i])
        }
        setNameNguoiTao(
          responsegetAllEmployee.data.employeeList.find(
            (el) => String(el.employeeId) === employeeId1,
          )?.employeeCodeName,
        )
        setCodeNguoiTao(
          responsegetAllEmployee.data.employeeList.find(
            (el) => String(el.employeeId) === employeeId1,
          )?.employeeCode,
        )
      }
      setLoading(false)
    }
  }
  //hi???n th??? k???t qu??? ch???n
  const displayValueDeXuatCho = dataDeXuatCho[selectedDeXuatCho.row]?.employeeCodeName
  const displayValue = data[selectedIndex.row]?.categoryName
  const displayValueCa1 = dataCa[selectedCa1.row]?.categoryName
  const displayValueCa2 = dataCa[selectedCa2.row]?.categoryName
  const displayValueNguoiPheDuyet =
    dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeCode +
    " - " +
    dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeName

  const displayValueNguoiThongBao = selectedNguoiThongBao.map((index) => {
    return (
      dataThongBaoCho[index.row]?.employeeCode + " - " + dataThongBaoCho[index.row]?.employeeName
    )
  })

  //render l???a ch???n
  const renderOptionLoaiDeXuat = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )
  const renderOptionCa = (title) => (
    <SelectItem key={title?.categoryId} title={title?.categoryName} />
  )
  const renderOptionDeXuatCho = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCodeName} />
  )
  const renderOptionNguoiPheDuyet = (title) => (
    <SelectItem key={title?.employeeId} title={title?.employeeCode + " - " + title?.employeeName} />
  )
  const renderOption = (title) => <SelectItem key={title?.categoryId} title={title?.categoryName} />
  // const { someStore, anotherStore } = useStores()

  const goBack = (err = "C?? l???i x???y ra, vui l??ng th??? l???i", boolean = false) => {
    Alert.alert(
      "Th??ng b??o",
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

  const goToPage = (page) => {
    navigation && navigation.navigate(page)
  }
  const huy = async () => {
    goToPage("ListDeXuatXinNghiScreen")
  }

  const luuNhap = async () => {
    if (isValidate === false) {
      return
    }
    var listNguoiThongBao = []
    var listNguoiThongBao1 = ""

    for (var k = 0; k < selectedNguoiThongBao.length; k++) {
      listNguoiThongBao.push(dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId)
      if (k === 0) {
        listNguoiThongBao1 = dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      } else {
        listNguoiThongBao1 =
          listNguoiThongBao1 + ", " + dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      }
    }

    const userInfo = await _unitOfWork.user.getUserEmployeeId()

    let payloadLuuNhap = {
      EmployeeRequest: {
        ApproverId: dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeId,
        CreateById: userInfo.userId,
        CreateDate: createDate,
        CreateEmployeeCode: codeNguoiTao,
        CreateEmployeeId: userInfo.employeeId,
        EnDate: date2,
        EndTypeTime: dataCa[parseInt(selectedCa1.row)]?.categoryId,
        NotifyList: listNguoiThongBao1,
        OfferEmployeeCode: dataDeXuatCho[selectedDeXuatCho.row]?.employeeCodeName,
        OfferEmployeeId: dataDeXuatCho[selectedDeXuatCho.row]?.employeeId,
        StartDate: date,
        StartTypeTime: dataCa[parseInt(selectedCa2.row)]?.categoryId,
        TypeRequest: data[selectedIndex.row]?.categoryId,
        Detail: lyDoNghi,
      },
      SendApproveAfterCreate: false,
    }

    let responseLuuNhap = await _unitOfWork.user.create(payloadLuuNhap)

    if (responseLuuNhap.data?.statusCode != 200) {
      goBack(responseLuuNhap.data?.messageCode)
      return
    }

    Alert.alert(
      "Th??ng b??o",
      responseLuuNhap.data?.messageCode,
      [
        {
          text: "OK",
          onPress: () => {
            goToPage("ListDeXuatXinNghiScreen")
          },
        },
      ],
      { cancelable: false },
    )
  }
  const luuNhap2 = async () => {
    if (isValidate === false) {
      return
    }
    var listNguoiThongBao = []
    var listNguoiThongBao1 = ""

    for (var k = 0; k < selectedNguoiThongBao.length; k++) {
      listNguoiThongBao.push(dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId)
      if (k === 0) {
        listNguoiThongBao1 = dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      } else {
        listNguoiThongBao1 =
          listNguoiThongBao1 + ", " + dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      }
    }

    const userInfo = await _unitOfWork.user.getUserEmployeeId()

    let payloadLuuNhap2 = {
      EmployeeRequest: {
        ApproverId: dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeId,
        CreateById: userInfo.userId,
        CreateDate: createDate,
        CreateEmployeeCode: codeNguoiTao,
        EmployeeRequestCode: maPhieu,
        CreateEmployeeId: userInfo.employeeId,
        EmployeeRequestId: params?.id,
        ManagerId: null,
        EnDate: date2,
        EndTypeTime: dataCa[parseInt(selectedCa1.row)]?.categoryId,
        NotifyList: listNguoiThongBao1,
        OfferEmployeeCode: dataDeXuatCho[selectedDeXuatCho.row]?.employeeCodeName,
        OfferEmployeeId: dataDeXuatCho[selectedDeXuatCho.row]?.employeeId,
        StartDate: date,
        StartTypeTime: dataCa[parseInt(selectedCa2.row)]?.categoryId,
        TypeRequest: data[selectedIndex.row]?.categoryId,
        Detail: lyDoNghi,
        RequestDate: new Date(),
        ShiftName: shiftName,
        StatusId: statusId,
        TypeReason: null,
        UpdateById: userInfo.userId,
        UpdateDate: new Date(),
      },
    }

    let responseLuuNhap2 = await _unitOfWork.user.editEmployeeRequestById(payloadLuuNhap2)

    if (responseLuuNhap2.data?.statusCode != 200) {
      goBack(responseLuuNhap2.data?.messageCode)
      return
    }
    Alert.alert(
      "Th??ng b??o",
      responseLuuNhap2.data?.messageCode,
      [
        {
          text: "OK",
          onPress: () => {
            fetchData()
            setCheckSua(false)
          },
        },
      ],
      { cancelable: false },
    )
  }

  const buttonSua = async () => {
    setCheckSua(true)
  }
  const buttonBack = async () => {
    setCheckSua(false)
  }
  // g???i ph?? duy???t ??? trang t???o ????? xu???t xn
  const guiPheDuyet = async () => {
    if (isValidate === false) {
      return
    }
    var listNguoiThongBao = []
    var listNguoiThongBao1 = ""
    for (var k = 0; k < selectedNguoiThongBao.length; k++) {
      listNguoiThongBao.push(dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId)
      if (k === 0) {
        listNguoiThongBao1 = dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      } else {
        listNguoiThongBao1 =
          listNguoiThongBao1 + ", " + dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      }
    }

    const userInfo = await _unitOfWork.user.getUserEmployeeId()

    let payloadGuiPheDuyet = {
      EmployeeRequest: {
        ApproverId: dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeId,
        CreateById: userInfo.userId,
        CreateDate: createDate,
        CreateEmployeeCode: codeNguoiTao,
        CreateEmployeeId: userInfo.employeeId,
        EnDate: date2,
        EndTypeTime: dataCa[parseInt(selectedCa1.row)]?.categoryId,
        NotifyList: listNguoiThongBao1,
        OfferEmployeeCode: dataDeXuatCho[selectedDeXuatCho.row]?.employeeCodeName,
        OfferEmployeeId: dataDeXuatCho[selectedDeXuatCho.row]?.employeeId,
        StartDate: date,
        StartTypeTime: dataCa[parseInt(selectedCa2.row)]?.categoryId,
        TypeRequest: data[selectedIndex.row]?.categoryId,
        Detail: lyDoNghi,
      },
      SendApproveAfterCreate: true,
    }

    let responseGuiPheDuyet = await _unitOfWork.user.create(payloadGuiPheDuyet)
    if (responseGuiPheDuyet.data?.statusCode != 200) {
      goBack(responseGuiPheDuyet.data?.messageCode)
      return
    }
    let payloadNextWorkflowStep = {
      FeatureCode: "PDDXXN",
      FeatureId: responseGuiPheDuyet.data.employeeRequestId,
      IsApprove: false,
      IsReject: false,
      IsSendingApprove: false,
      RecordName: "",
      RejectComment: "",
    }
    let responseNextWorkflowStep = await _unitOfWork.user.nextWorkflowStep(payloadNextWorkflowStep)
    if (responseNextWorkflowStep.data?.statusCode != 202) {
      goBack(responseNextWorkflowStep.data?.messageCode)
      return
    }
    let payloadNextWorkflowStep2 = {
      FeatureCode: "PDDXXN",
      FeatureId: responseGuiPheDuyet.data.employeeRequestId,
      IsApprove: false,
      IsReject: false,
      IsSendingApprove: true,
      RecordName: "",
      RejectComment: "",
    }
    let responseNextWorkflowStep2 = await _unitOfWork.user.nextWorkflowStep(
      payloadNextWorkflowStep2,
    )
    if (responseNextWorkflowStep2.data?.statusCode != 202) {
      goBack(responseNextWorkflowStep2.data?.messageCode)
      return
    }
    // g???i email
    // let payloadSendEmailPersonApprove = {
    //   ApproveId: dataNguoiPheDuyet[selectedNguoiPheDuyet.row]?.employeeId,
    //   CaEnd: displayValueCa1,
    //   CaStart: displayValueCa2,
    //   DateCreate: formatDate(createDate),
    //   DateEnd: formatDate(date2),
    //   DateStart: formatDate(date),
    //   FullNameRequest: displayValueDeXuatCho,
    //   ListFullNameNotify: displayValueNguoiThongBao.join(", "),
    //   Note: lyDoNghi,
    //   RequestEmployeeId:responseGuiPheDuyet.data.employeeRequestId,
    //   RequestType:displayValue
    // }
    // console.log(payloadSendEmailPersonApprove)
    // let responseSendEmailPersonApprove = await _unitOfWork.user.sendEmailPersonApprove(payloadSendEmailPersonApprove)
    // if (responseSendEmailPersonApprove.data?.statusCode != 202) {
    //   goBack(responseSendEmailPersonApprove.data?.messageCode)
    //   return
    // }
    Alert.alert(
      "Th??ng b??o",
      responseNextWorkflowStep2.data?.messageCode,
      [
        {
          text: "OK",
          onPress: () => {
            goToPage("ListDeXuatXinNghiScreen")
          },
        },
      ],
      { cancelable: false },
    )
  }
  // ??? trang chi ti???t ????? xu???t ngh???
  const guiPheDuyet2 = async () => {
    if (isValidate === false) {
      return
    }
    let listNguoiThongBao = []
    let listNguoiThongBao1 = ""
    for (var k = 0; k < selectedNguoiThongBao.length; k++) {
      listNguoiThongBao.push(dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId)
      if (k === 0) {
        listNguoiThongBao1 = dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      } else {
        listNguoiThongBao1 =
          listNguoiThongBao1 + ", " + dataThongBaoCho[selectedNguoiThongBao[k].row]?.employeeId
      }
    }

    let payloadNextWorkflowStep = {
      FeatureCode: "PDDXXN",
      FeatureId: params?.id,
      IsApprove: false,
      IsReject: false,
      IsSendingApprove: true,
      RecordName: "",
      RejectComment: "",
    }
    let responseNextWorkflowStep = await _unitOfWork.user.nextWorkflowStep(payloadNextWorkflowStep)
    if (responseNextWorkflowStep.data?.statusCode != 202) {
      goBack(responseNextWorkflowStep.data?.messageCode)
      return
    }
    Alert.alert(
      "Th??ng b??o",
      responseNextWorkflowStep.data?.messageCode,
      [
        {
          text: "OK",
          onPress: () => {
            goToPage("ListDeXuatXinNghiScreen")
          },
        },
      ],
      { cancelable: false },
    )
  }
  // header cho trang t???o ????? xu???t xin ngh???
  const headerButton = () => {
    return (
      <View style={styles.containerHeader}>
        <TouchableOpacity style={styles.button11}>
          <Button onPress={huy}>H???y</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2}>
          <Button onPress={luuNhap}>L??u nh??p</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button3}>
          <Button onPress={guiPheDuyet}>G???i ph?? duy???t</Button>
        </TouchableOpacity>
      </View>
    )
  }
  // header cho trang ch???nh s???a
  const headerButtonChinhSua = () => {
    return (
      <View style={styles.containerHeader}>
        <TouchableOpacity style={styles.button11}>
          <Button onPress={buttonSua}>S???a</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button3}>
          <Button onPress={guiPheDuyet2}>g???i ph?? duy???t</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2}>
          <Button onPress={() => navigation.goBack()}>Quay l???i</Button>
        </TouchableOpacity>
      </View>
    )
  }
  // header cho trang ch???nh s???a khi click v??o n??t s???a
  const headerButtonChinhSua2 = () => {
    return (
      <View style={styles.containerHeader}>
        <TouchableOpacity style={styles.button11}>
          <Button onPress={luuNhap2}>L??u</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button3}>
          <Button onPress={guiPheDuyet2}>g???i ph?? duy???t</Button>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button11}>
          <Button onPress={buttonBack}>H???y</Button>
        </TouchableOpacity>
      </View>
    )
  }
  const headerButtonChoPheDuyet = () => {
    return <View></View>
  }
  // tr???ng th??i
  const headerTrangThai = () => {
    return (
      <View style={styles.containerHeaderTrangThai}>
        <Text style={styles.textTrangThai}>Tr???ng th??i: {trangThai} </Text>
      </View>
    )
  }

  return (
    <>
      {isLoading && <Loading />}
      <Screen style={ROOT} preset="fixed">
        <Header
          headerText={
            params?.id !== undefined ? "Th??ng tin ????? xu???t ph?? duy???t ph??p" : "T???o ????? xu???t xin ngh???"
          }
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
        />
        <ScrollView>
          <View style={styles.container}>
            {params?.id !== undefined &&
              trangThai === "??ang ch??? ph?? duy???t" &&
              headerButtonChoPheDuyet()}
            {params?.id !== undefined &&
              trangThai === "Nh??p" &&
              checkSua === false &&
              headerButtonChinhSua()}
            {params?.id === undefined && headerButton()}
            {params?.id !== undefined && checkSua === true && headerButtonChinhSua2()}
            {params?.id !== undefined && headerTrangThai()}

            <View style={styles.containerBody}>
              <Text style={styles.text}>
                M?? phi???u:
                {params?.id !== undefined ? maPhieu : "(s??? ???????c h??? th???ng t???o sau khi l??u)"}
              </Text>

              <Text style={styles.text}>Ng??y t???o: {formatDate(createDate)}</Text>

              <Text style={styles.text}>Ng?????i t???o: {nameNguoiTao}</Text>

              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="????? xu???t cho*"
                  style={styles.select}
                  placeholder="Default"
                  value={displayValueDeXuatCho}
                  selectedIndex={selectedDeXuatCho}
                  onSelect={(index) => {
                    setSelectedDeXuatCho(index)
                    fetchData()
                  }}
                >
                  {dataDeXuatCho.map(renderOptionDeXuatCho)}
                </Select>
              </Layout>

              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="Lo???i ????? xu???t*"
                  style={styles.select}
                  placeholder="Default"
                  value={displayValue}
                  selectedIndex={selectedIndex}
                  onSelect={(index) => setSelectedIndex(index)}
                >
                  {data.map(renderOptionLoaiDeXuat)}
                </Select>
              </Layout>
              <Text style={styles.select}>Ng??y ????? xu???t:</Text>

              <Layout level="1">
                <Datepicker
                  disabled={checkSua === true ? false : true}
                  style={styles.date}
                  label="T??? ng??y:"
                  placeholder="Pick Date"
                  date={date}
                  onSelect={(nextDate) => setDate(nextDate)}
                  accessoryRight={CalendarIcon}
                  status={date >= date2 && valueCa === "0" ? "danger" : "basic"}
                />
              </Layout>
              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="Ca*"
                  style={styles.select}
                  placeholder="Default"
                  value={displayValueCa1}
                  selectedIndex={selectedCa1}
                  onSelect={(index) => setSelectedCa1(index)}
                  status={date >= date2 && valueCa === "0" ? "danger" : "basic"}
                >
                  {dataCa.map(renderOptionCa)}
                </Select>
              </Layout>

              <Layout level="1">
                <Datepicker
                  disabled={checkSua === true ? false : true}
                  style={styles.date}
                  label="?????n ng??y:"
                  placeholder="Pick Date"
                  date={date2}
                  onSelect={(nextDate) => setDate2(nextDate)}
                  accessoryRight={CalendarIcon}
                  status={date >= date2 && valueCa === "0" ? "danger" : "basic"}
                />
              </Layout>

              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="Ca*"
                  style={styles.select}
                  placeholder="Default"
                  value={displayValueCa2}
                  selectedIndex={selectedCa2}
                  onSelect={(index) => setSelectedCa2(index)}
                  status={date >= date2 && valueCa === "0" ? "danger" : "basic"}
                >
                  {dataCa.map(renderOption)}
                </Select>
              </Layout>
              <Input
                disabled={checkSua === true ? false : true}
                style={styles.input}
                value={valueCa}
                label="T???ng s??? ng??y"
              ></Input>
              <Input
                disabled={checkSua === true ? false : true}
                multiline={true}
                style={styles.inputMul}
                label="Chi ti???t l?? do ngh???"
                value={lyDoNghi}
                onChangeText={setLyDoNghi}
                textStyle={{ minHeight: 64 }}
              ></Input>

              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="Ng?????i ph?? duy???t*"
                  style={styles.select}
                  placeholder="Default"
                  value={displayValueNguoiPheDuyet}
                  selectedIndex={selectedNguoiPheDuyet}
                  onSelect={(index) => {
                    setSelectedNguoiPheDuyet(index)
                  }}
                >
                  {dataNguoiPheDuyet.map(renderOptionNguoiPheDuyet)}
                </Select>
              </Layout>

              <Layout level="1">
                <Select
                  disabled={checkSua === true ? false : true}
                  label="Th??ng b??o cho"
                  multiSelect={true}
                  style={styles.select}
                  placeholder="Default"
                  value={displayValueNguoiThongBao.join(", ")}
                  selectedIndex={selectedNguoiThongBao}
                  onSelect={(index) => setSelectedNguoiThongBao(index)}
                >
                  {dataThongBaoCho.map(renderOptionNguoiPheDuyet)}
                </Select>
              </Layout>
            </View>
          </View>
          <View style={{ marginBottom: 16 }} />
        </ScrollView>
      </Screen>
    </>
  )
})
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F8",
  },
  containerHeaderTrangThai: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 4,
    height: 60,
    justifyContent: "flex-start",
    alignItems: "center",
    marginRight: 8,
  },
  containerHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 4,
    height: 60,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  containerHeaderChoPheDuyet: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginTop: 4,
    height: 60,
    alignItems: "center",
    marginRight: 6,
    justifyContent: "flex-end",
  },
  containerBody: {
    marginTop: 4,
    flex: 1,
    backgroundColor: "#fff",
  },
  containerBottom: {
    flex: 1,
    backgroundColor: "#fff",
    marginVertical: 6,
  },
  button11: {
    width: "20%",
    height: 45,
  },
  button2: {
    width: "27%",
    height: 45,
  },
  button3: {
    width: "35%",
    height: 45,
  },
  text: {
    fontSize: 15,
    marginHorizontal: 10,
    marginVertical: 6,
  },
  textTrangThai: {
    fontSize: 15,
    marginHorizontal: 10,
    marginVertical: 6,
    color: "red",
  },
  input: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
  },
  inputMul: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
    minHeight: 64,
  },
  select: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
  },
  date: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
  },
})
