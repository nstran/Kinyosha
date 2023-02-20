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
  ScrollView,
} from "react-native"
import { Header, Loading, Screen, Text } from "../../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../../theme"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
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
  CheckBox,
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

export const ChiTietKhachHangTiemNangScreen = observer(function ChiTietKhachHangTiemNangScreen() {
  const router: any = useRoute()
  const params = router.params
  const [isSubmit, setSubmit] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const navigation = useNavigation()
  const [checked, setChecked] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0))
  const headerButtonChiTiet = () => {
    return (
      <View style={styles.headerButtonChiTietKhacHang}>
        <Button style={styles.button2}>Tạo cơ hội</Button>
        <Button style={styles.button1}>Thoát</Button>
        <Button style={styles.button1}>Xóa</Button>
        <Button style={styles.button1}>Sửa</Button>
      </View>
    )
  }

  const thongTinKhachHangCaNhan = () => {
    return (
      <View>
        <Text style={styles.contenerTextHeader}>
          <FontAwesome5 name="chevron-circle-down" size={17} color="black" /> Thông tin
        </Text>
        <Button>Chuyển trạng thái</Button>
        <View>
          <Button>Mới tạo</Button>
          <Layout level="1">
            <Select selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
              <SelectItem title="Option 1" />
              <SelectItem title="Option 2" />
            </Select>
          </Layout>
          <Button>Đang làm việc</Button>
          <Button>Chăm sóc</Button>
          <Button>Chuyển đổi</Button>
        </View>
        <View>
          <CheckBox checked={checked} onChange={(nextChecked) => setChecked(nextChecked)}>
            Khách dự án
          </CheckBox>
          <Text style={styles.contenerTextBoody}>Xưng hô</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder=""
              // value={displayNhomKhacHang()}
              // selectedIndex={formDataSelect.selectedNhomKhachHang}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedNhomKhachHang = index
              //   setFormDataSelect(_formDataSelect)
              // }}
            >
              {/* {listDataNhomKhachHang.map(renderOptionNhomKhachHang)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Xưng hô</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder=""
              // value={displayNhomKhacHang()}
              // selectedIndex={formDataSelect.selectedNhomKhachHang}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedNhomKhachHang = index
              //   setFormDataSelect(_formDataSelect)
              // }}
            >
              {/* {listDataNhomKhachHang.map(renderOptionNhomKhachHang)} */}
            </Select>
          </Layout>
          <Text style={styles.contenerTextBoody}>Họ và tên đệm</Text>
          <Input
          // onChangeText={(text) => {
          //   let _formDataThongTin = { ...formDataThongTin }
          //   ;(_formDataThongTin.hoVaTenDem = text), setFormDataThongTin(_formDataThongTin)
          // }}
          ></Input>
          <Text style={styles.contenerTextBoody}>Tên*</Text>
          <Input
          // onChangeText={(text) => {
          //   let _formDataThongTin = { ...formDataThongTin }
          //   ;(_formDataThongTin.ten = text), setFormDataThongTin(_formDataThongTin)
          // }}
          // status={formDataThongTin?.ten?.length === 0 && submit === true ? "danger" : "basic"}
          ></Input>
          <Text style={styles.contenerTextBoody}>Số điện thoại</Text>
          <Input
            keyboardType="numeric"
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.sdt = text), setFormDataThongTin(_formDataThongTin)
            //   // checkDuplicateInforCustomerPhone()
            // }}
            // status={validateSdt(formDataThongTin.sdt) === false ? "danger" : "basic"}
          ></Input>

          <Text style={styles.contenerTextBoody}>Số điện thoại khác</Text>
          <Input
            keyboardType="numeric"
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.sdt = text), setFormDataThongTin(_formDataThongTin)
            //   // checkDuplicateInforCustomerPhone()
            // }}
            // status={validateSdt(formDataThongTin.sdt) === false ? "danger" : "basic"}
          ></Input>

          <Text style={styles.contenerTextBoody}>Nguồn tiềm năng*</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn nguồn tiềm năng"
              // value={displayNguonTiemNang()}
              // selectedIndex={formDataSelect.selectedNguonTiemNang}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedNguonTiemNang = index
              //   setFormDataSelect(_formDataSelect)
              // }}
              // status={
              //   formDataSelect.selectedNguonTiemNang === null && submit === true
              //     ? "danger"
              //     : "basic"
              // }
            >
              {/* {listDataNguonTiemNang.map(renderOptionNguonTiemNang)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Nhóm khách hàng</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn nhóm khách hàng"
              // value={displayNhomKhacHang()}
              // selectedIndex={formDataSelect.selectedNhomKhachHang}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedNhomKhachHang = index
              //   setFormDataSelect(_formDataSelect)
              // }}
            >
              {/* {listDataNhomKhachHang.map(renderOptionNhomKhachHang)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Người phụ trách*</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn người phụ trách"
              // value={displayNguoiPhuTrach()}
              // selectedIndex={formDataSelect.selectedNguoiPhuTrach}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedNguoiPhuTrach = index
              //   setFormDataSelect(_formDataSelect)
              // }}
              // status={
              //   formDataSelect.selectedNguoiPhuTrach === null && submit === true
              //     ? "danger"
              //     : "basic"
              // }
            >
              {/* {listDataNguoiPhuTrach.map(renderOptionNguoiPhuTrach)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Email</Text>
          <Input
            keyboardType="email-address"
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.email = text), setFormDataThongTin(_formDataThongTin)
            //   // checkDuplicateInforCustomerEmail()
            // }}
            // status={validateEmail(formDataThongTin.email) === false ? "danger" : "basic"}
          ></Input>

          <Text style={styles.contenerTextBoody}>Địa chỉ</Text>
          <Input
          // onChangeText={(text) => {
          //   let _formDataThongTin = { ...formDataThongTin }
          //   ;(_formDataThongTin.diaChi = text), setFormDataThongTin(_formDataThongTin)
          // }}
          ></Input>

          <CheckBox checked={checked} onChange={(nextChecked) => setChecked(nextChecked)}>
            Không gửi email
          </CheckBox>

          <CheckBox checked={checked} onChange={(nextChecked) => setChecked(nextChecked)}>
            Không gọi điện
          </CheckBox>

          <Text style={styles.contenerTextBoody}>Link facebook</Text>
          <Input
          // onChangeText={(text) => {
          //   let _formDataThongTin = { ...formDataThongTin }
          //   ;(_formDataThongTin.linkFacebook = text), setFormDataThongTin(_formDataThongTin)
          // }}
          ></Input>

          <Text style={styles.contenerTextBoody}>Khu vực</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn khu vực"
              // value={displayKhuVuc()}
              // selectedIndex={formDataSelect.selectedKhuVuc}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedKhuVuc = index
              //   setFormDataSelect(_formDataSelect)
              // }}
            >
              {/* {listDataKhuVuc.map(renderOptionKhuVuc)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Trạng thái chăm sóc</Text>
          <Layout level="1">
            <Select
              style={styles.select}
              placeholder="Chọn trạng thái chăm sóc"
              // value={displayKhuVuc()}
              // selectedIndex={formDataSelect.selectedKhuVuc}
              // onSelect={(index) => {
              //   let _formDataSelect = { ...formDataSelect }
              //   _formDataSelect.selectedKhuVuc = index
              //   setFormDataSelect(_formDataSelect)
              // }}
            >
              {/* {listDataKhuVuc.map(renderOptionKhuVuc)} */}
            </Select>
          </Layout>

          <Text style={styles.contenerTextBoody}>Ghi chú</Text>
          <Input
            multiline={true}
            style={styles.inputMul}
            // value={}
            // onChangeText={(text) => {
            //   let _formDataThongTin = { ...formDataThongTin }
            //   ;(_formDataThongTin.ghiChu = text), setFormDataThongTin(_formDataThongTin)
            // }}
            textStyle={{ minHeight: 64 }}
          ></Input>
        </View>
      </View>
    )
  }

  const bodyChiTiet = () => {
    return (
      <View>
        <Text style={styles.contenerTextHeader}>
          <FontAwesome5 name="chevron-circle-down" size={17} color="black" /> Chi tiết
        </Text>
        <View>
          <Button>Tài liệu đính kèm</Button>
          <Button>Hàng hóa quan tâm</Button>
        </View>
        <View>
          <Button>Hoạt động</Button>
          <Button>Báo giá</Button>
          <Button>Cơ hội</Button>
        </View>
      </View>
    )
  }

  const taiLieuDinhKem = () => {
    return <View></View>
  }
  return (
    <>
      {isLoading && <Loading />}
      <Screen style={ROOT} preset="fixed">
        <Header
          headerText="Chi tiết khách hàng tiềm năng"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          style={HEADER}
          titleStyle={HEADER_TITLE}
        />
        <ScrollView>
          <View style={styles.packAll}>
            {headerButtonChiTiet()}
            {thongTinKhachHangCaNhan()}
            {bodyChiTiet()}
          </View>

          <View style={{ marginBottom: 16 }} />
        </ScrollView>
      </Screen>
    </>
  )
})
const styles = StyleSheet.create({
  packAll: {
    marginHorizontal: 12,
  },
  headerButtonChiTietKhacHang: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 6,
  },
  button1: {
    width: "20%",
    height: 45,
  },
  button2: {
    width: "35%",
    height: 45,
  },
  contenerTextHeader: {
    color: "black",
    fontSize: 17,
    marginBottom: 6,
    fontWeight: "700",
  },
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
})
