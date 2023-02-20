import React, {
  useState,
} from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  StyleSheet,
  Image,
  Text,
  ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, ViewStyle,
} from "react-native"
import { Loading, Screen } from "../../components"
import {
  useNavigation,
} from "@react-navigation/native"
import { color } from "../../theme"
import { Input, Button } from "@ui-kitten/components"
import { Feather } from "@expo/vector-icons"
import { images } from "../../images"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"

const _unitOfWork = new UnitOfWorkService()

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

export const ForgotPasswordScreen = observer(function ForgotPasswordScreen() {
    const navigation = useNavigation()
    const [userName, setUserName] = useState<any>("")
    const [isLoading, setLoading] = useState(false)
    const [isSubmit, setSubmit] = useState(false)

    const goToPage = (page) => {
      navigation && navigation.navigate((page))
    }

    const checkInfo = () => {
      return !(userName.trim() == "")
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

    const actionLogin = async () => {
      setLoading(true)
      let payload: any = {
        "UserName": userName,
      }
      let response: any = await _unitOfWork.user.getCheckUserName(payload)
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        setLoading(false)
        goBack(response.data?.messageCode)
        return
      }
      payload = {
        "UserId": response.data?.userId,
        "UserName": response.data?.userName,
        "FullName": response.data?.fullName,
        "EmailAddress": response.data?.emailAddress,
        "Password": "",
        "Re_password": "",
      }
      response = await _unitOfWork.user.sendEmailForgotPass(payload)
      setLoading(false)
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        goBack(response.data?.messageCode)
        return
      }
      Alert.alert("Thông báo",
        "Hệ thống đã gửi hướng dẫn vào email gắn với tài khoản của bạn. Vui lòng kiểm tra email và làm theo hướng dẫn.",
        [{
          text: "OK", onPress: () => {
            goToPage("LoginScreen")
          },
        }], { cancelable: false })
    }

    const goToLogin = async () => {
      setSubmit(true)
      if (checkInfo()) {
        await actionLogin()
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
              <Image source={images.logo} style={[styles.logo]}/>
              <View style={{ width: "100%", paddingHorizontal: 16 }}>
                <Input
                  keyboardType='email-address'
                  onSubmitEditing={() => goToLogin()}
                  autoCapitalize='none'
                  status={isSubmit && userName?.trim() == "" ? "danger" : "basic"}
                  size='large'
                  style={styles.input}
                  placeholder='Tên đăng nhập'
                  value={userName}
                  onChangeText={nextValue => {
                    setUserName(nextValue)
                  }}
                  accessoryLeft={() => {
                    return (
                      <Feather name="user" size={20} color={color.palette.lightGrey}/>
                    )
                  }}
                />
                <Button onPress={() => goToLogin()}>
                  Lấy lại mật khẩu
                </Button>
                <TouchableOpacity style={styles.forgotPassword} onPress={() => goToPage("LoginScreen")}>
                  <Text style={styles.forgotPasswordText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
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
    flex: 1, justifyContent: "center", alignItems: "center",
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
    alignItems: "center",
    marginTop: 16,
  },
})
