import React, {
  useRef,
  useState,
} from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, TextStyle, ViewStyle,
} from "react-native"
import { Header, Loading, Screen } from "../../components"
import {
  useNavigation,
} from "@react-navigation/native"
import { color, spacing } from "../../theme"
import { Input, Button } from "@ui-kitten/components"
import { Feather, Ionicons } from "@expo/vector-icons"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { useStores } from "../../models"

const _unitOfWork = new UnitOfWorkService()

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

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

export const ChangePasswordScreen = observer(function ChangePasswordScreen() {
    const navigation = useNavigation()
    const [data, setData] = useState<any>({
      oldPassword: "",
      newPassword: "",
      newPassConfirm: "",
    })
    const [secureTextEntry, setSecureTextEntry] = useState({
      oldPassword: true,
      newPassword: true,
      newPassConfirm: true,
    })
    const [isLoading, setLoading] = useState(false)
    const [isSubmit, setSubmit] = useState(false)
    const inputNewPassword = useRef(null)
    const inputNewPassConfirm = useRef(null)
    const { tnmStore } = useStores()

    const toggleSecureEntry = (type) => {
      let _secureTextEntry = { ...secureTextEntry }
      _secureTextEntry[type] = !_secureTextEntry[type]
      setSecureTextEntry(_secureTextEntry)
    }

    const checkInfo = () => {
      if (data?.oldPassword?.trim() == "" || data?.newPassword?.trim() == "" || data?.newPassConfirm?.trim() == "") {
        return false
      }
      if (data?.newPassword != data?.newPassConfirm) {
        return false
      }
      return true
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

    const changePassword = async () => {
      setSubmit(true)
      if (checkInfo()) {
        setLoading(true)
        let payload = {
          "OldPassword": data?.oldPassword,
          "NewPassword": data?.newPassword,
        }
        let response = await _unitOfWork.user.changePassword(payload)
        setLoading(false)
        // console.log(response.data)
        if (response.data?.statusCode != 200) {
          goBack(response.data?.messageCode)
          return
        }
        await tnmStore.setAuthPath("password", data?.newPassword)
        setSubmit(false)
        setData({
          oldPassword: "",
          newPassword: "",
          newPassConfirm: "",
        })
        setSecureTextEntry({
          oldPassword: true,
          newPassword: true,
          newPassConfirm: true,
        })
        Alert.alert("Thông báo", "Thay đổi mật khẩu thành công", [{
          text: "OK", onPress: () => {
          },
        }], { cancelable: false })
      }
    }

    return (
      <>
        {isLoading && <Loading/>}
        <Screen style={ROOT} preset="scroll">
          {/*<View style={{ flex: 1, backgroundColor: color.palette.white }}>*/}
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps='handled'>
            <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === "ios" ? "padding" : "height"}>
              {/*<Screen style={ROOT} preset="fixed">*/}
              <Header
                headerText="THAY ĐỔI MẬT KHẨU"
                leftIcon="back"
                onLeftPress={() => navigation.goBack()}
                style={HEADER}
                titleStyle={HEADER_TITLE}
              />
              <View style={{ width: "100%", paddingHorizontal: 16 }}>
                <Input
                  onSubmitEditing={() => inputNewPassword.current.focus()}
                  autoCapitalize='none'
                  status={isSubmit && data?.oldPassword?.trim() == "" ? "danger" : "basic"}
                  size='large'
                  style={styles.input}
                  placeholder='Mật khẩu cũ'
                  value={data?.oldPassword}
                  onChangeText={nextValue => {
                    let _data = { ...data }
                    _data.oldPassword = nextValue
                    setData(_data)
                  }}
                  secureTextEntry={secureTextEntry.oldPassword}
                  accessoryRight={() => {
                    return (
                      <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => toggleSecureEntry("oldPassword")}>
                        <Ionicons name={secureTextEntry.oldPassword ? "eye-off" : "eye"} size={22}
                                  color={color.palette.lightGrey}/>
                      </TouchableOpacity>
                    )
                  }}
                  accessoryLeft={() => {
                    return (
                      <Feather name="lock" size={20} color={color.palette.lightGrey}/>
                    )
                  }}
                />
                <Input
                  ref={inputNewPassword}
                  onSubmitEditing={() => inputNewPassConfirm.current.focus()}
                  autoCapitalize='none'
                  status={isSubmit && data?.newPassword?.trim() == "" ? "danger" : "basic"}
                  size='large'
                  style={styles.input}
                  placeholder='Mật khẩu mới'
                  value={data?.newPassword}
                  onChangeText={nextValue => {
                    let _data = { ...data }
                    _data.newPassword = nextValue
                    setData(_data)
                  }}
                  secureTextEntry={secureTextEntry.newPassword}
                  accessoryRight={() => {
                    return (
                      <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => toggleSecureEntry("newPassword")}>
                        <Ionicons name={secureTextEntry.newPassword ? "eye-off" : "eye"} size={22}
                                  color={color.palette.lightGrey}/>
                      </TouchableOpacity>
                    )
                  }}
                  accessoryLeft={() => {
                    return (
                      <Feather name="lock" size={20} color={color.palette.lightGrey}/>
                    )
                  }}
                />
                <Input
                  ref={inputNewPassConfirm}
                  onSubmitEditing={() => changePassword()}
                  autoCapitalize='none'
                  status={isSubmit && (data?.newPassConfirm?.trim() == "" ||
                    data?.newPassword != data?.newPassConfirm)
                    ? "danger" : "basic"}
                  size='large'
                  style={styles.input}
                  placeholder='Nhập lại mật khẩu mới'
                  value={data?.newPassConfirm}
                  onChangeText={nextValue => {
                    let _data = { ...data }
                    _data.newPassConfirm = nextValue
                    setData(_data)
                  }}
                  secureTextEntry={secureTextEntry.newPassConfirm}
                  accessoryRight={() => {
                    return (
                      <TouchableOpacity style={{ paddingRight: 8 }} onPress={() => toggleSecureEntry("newPassConfirm")}>
                        <Ionicons name={secureTextEntry.newPassConfirm ? "eye-off" : "eye"} size={22}
                                  color={color.palette.lightGrey}/>
                      </TouchableOpacity>
                    )
                  }}
                  accessoryLeft={() => {
                    return (
                      <Feather name="lock" size={20} color={color.palette.lightGrey}/>
                    )
                  }}
                />
                <Button style={{ marginTop: 8 }} onPress={() => changePassword()}>
                  Thay đổi mật khẩu
                </Button>
              </View>
              {/*</Screen>*/}
            </KeyboardAvoidingView>
          </ScrollView>
          {/*</View>*/}
        </Screen>
      </>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.palette.white,
  },
  input: {
    marginBottom: 16,
  },
  logo: {
    height: 66,
    resizeMode: "contain",
    marginBottom: 24,
  },
  forgotPasswordText: {
    textDecorationLine: "underline",
    fontStyle: "italic",
  },
  forgotPassword: {
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 8,
    alignItems: "flex-end",
  },
})
