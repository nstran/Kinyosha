import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native"

import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle, ScrollView } from "react-native"
import { Header, Loading, Screen } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../../theme"
import {
  Button,
  Input,
  SelectItem,
  Select,
  Layout,
  IndexPath,
  Datepicker,
  Icon,
  Radio,
  RadioGroup
} from "@ui-kitten/components"
import { Feather, Ionicons } from "@expo/vector-icons"
var data = [{name:"Công ty A",
phone:"0999999",
email:"ssssss@gmail.com",
status:"Định danh",
nguoiPhuTrach:""},
{name:"Công ty B",
phone:"0999999",
email:"ssssss@gmail.com",
status:"Định danh",
nguoiPhuTrach:""},
{name:"Công ty C",
phone:"0999999",
email:"ssssss@gmail.com",
status:"Định danh",
nguoiPhuTrach:""},{name:"Công ty D",
phone:"0999999",
email:"ssssss@gmail.com",
status:"Định danh",
nguoiPhuTrach:""}]
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
function thongBao(){
  console.log("test")
}
export const QuanTriKhachHangScreen = observer(function QuanTriKhachHangScreen() {

  const navigation = useNavigation()
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  function thongBao() {
    console.log(selectedIndex)
  }
  const renderOption = (title) => 
    <Radio style={styles.test} key={title.name}  > <View>
    <Text>Họ và tên: </Text>
    <Text>Số điện thoại: </Text>
    <Text>Email: </Text>
    <Text>Trạng thái: </Text>
    <Text>Người phụ trách: </Text></View>
    <View><Text>{title.name}</Text>
    <Text>{title.phone}</Text>
    <Text>{title.email}</Text>
    <Text>{title.status}</Text>
    <Text>{title.nguoiPhuTrach}</Text>
    </View></Radio>
  
  
  return (
    <Screen style={ROOT} preset="fixed">
      <Header
        headerText="Quản trị khách hàng"
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
        style={HEADER}
        titleStyle={HEADER_TITLE}
      />
      <ScrollView>
        <View style={styles.containerHeader}>
          <Text style={styles.containerHeaderText}>Dashboard</Text>
          <Text style={styles.text}>Thứ 2, ngày 18 tháng 4 năm 2022</Text>
          <View style={styles.containerHeaderSwap}>
            <Input
              style={styles.inputSearch}
              placeholder="Nhập tên khách hàng"
              accessoryRight={() => {
                return (
                  <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => thongBao()}>
                    <Ionicons
                      name='search'
                      size={22}
                      color={color.palette.lightGrey}
                    />
                  </TouchableOpacity>
                )
              }}
            ></Input>

            <Button style={styles.containerHeaderButton}>Tạo khách hàng</Button>
          </View>
          <View style={styles.containerBody4}>

          </View>
          <View style={styles.containerBody4}></View>
          <View style={styles.containerBody4}></View>
          <View style={styles.containerBody4}>
            <Text>Danh sách khách hàng định danh mới nhất</Text>
            <RadioGroup
        selectedIndex={selectedIndex}
        onChange={index => setSelectedIndex(index)}>
        {data.map(renderOption)}
      </RadioGroup>
          </View>
          <Button onPress={thongBao}>Lưu nháp</Button>
        </View>
      </ScrollView>
    </Screen>
  )
})
const styles = StyleSheet.create({
  containerHeader: {
    backgroundColor: "#fff",
    marginVertical: 4,
    marginHorizontal: 10,
  },
  containerHeaderText: {
    fontSize: 19,
    fontWeight: "500",
    marginVertical: 4,
  },
  text: {
    fontSize: 15,
    marginVertical: 4,
  },
  containerHeaderSwap: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputSearch: {
    width: "57%",
    height: 20,
  },
  inputSearchIcon: {
    fontSize: 24,
    color: "black",
  },
  containerHeaderButton: {
    width: "38%",
    paddingTop:2,
    paddingBottom:2
  },
  containerBody4:{
    height: 500,
    backgroundColor: "#fff",
    marginVertical: 4,
    borderLeftWidth:1,
    borderRightWidth:1,
    borderTopWidth: 1,
    borderBottomWidth:1,
    borderTopColor:'#E5E5E5',
    borderRightColor:'#E5E5E5',
    borderLeftColor:'#E5E5E5',
    borderBottomColor:'#E5E5E5'
  },
  test:{
    flexDirection:"row",
    alignItems: 'flex-start',
    marginLeft:10
  }
})
