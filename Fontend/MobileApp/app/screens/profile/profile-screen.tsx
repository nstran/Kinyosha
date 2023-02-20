import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
  Dimensions,
  View,
  TextStyle,
  ScrollView,
  KeyboardAvoidingView, Platform, Alert, RefreshControl,
} from "react-native"
import { Header, Loading, Screen } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"
import { images } from "../../images"
import { FontAwesome } from "@expo/vector-icons"
import { Button, Input } from "@ui-kitten/components"
import { useStores } from "../../models"
import * as ImagePicker from "expo-image-picker"
import { UnitOfWorkService } from "../../services/api/unitOfWork-service"
import { Feather } from "@expo/vector-icons"

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

export const ProfileScreen = observer(function ProfileScreen() {
  const [isSubmit, setSubmit] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isRefresh, setRefresh] = useState(false)
  const [data, setData] = useState({
    userAvatar: null,
    email: null,
    firstName: null,
    lastName: null,
    username: null,
  })
  const { tnmStore } = useStores()
  // const { auth, userInfo } = tnmStore

  // Pull in navigation via hook
  const navigation = useNavigation()

  useEffect(() => {
    fetchData()
  }, [isRefresh])
  const fetchData = async () => {
    setRefresh(false)
    if (!isRefresh) {
      setLoading(true)
      let response = await _unitOfWork.user.getUserProfile({})
      setLoading(false)
      // console.log(response.data)
      if (response.data?.statusCode != 200) {
        goBack(response.data?.messageCode)
        return
      }
      let _data = { ...data }
      _data.userAvatar = response.data?.avatarUrl
      _data.email = response.data?.email
      _data.firstName = response.data?.firstName
      _data.lastName = response.data?.lastName
      _data.username = response.data?.username
      await tnmStore.setUserInfo({
        userAvatar: response.data?.avatarUrl,
        email: response.data?.email,
        firstName: response.data?.firstName,
        lastName: response.data?.lastName,
      })
      await tnmStore.setAuthPath("username", response.data?.username)
      setData(_data)
    }
  }

  const changeValueText = (type, value) => {
    let _data = { ...data }
    _data[type] = value
    setData(_data)
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

  const pickImage = async () => {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
      allowsEditing: false,
    })

    // console.log(result)

    if (!result.cancelled) {
      let _data = { ...data }
      _data.userAvatar = "data:image/png;base64," + result.base64
      setData(_data)
    }
  }

  const checkInfo = () => {
    return !(data?.email?.trim() == "" || data?.firstName?.trim() == "" || data?.lastName?.trim() == "")
  }

  const luuThongTin = async () => {
    setSubmit(true)
    if (checkInfo()) {
      setLoading(true)
      let payload = {
        "AvatarUrl": data.userAvatar,
        "Username": data.username,
        "FirstName": data.firstName,
        "LastName": data.lastName,
        "Email": data.email,
      }
      let response = await _unitOfWork.user.editUserProfile(payload)
      setLoading(false)
      if (response.data?.statusCode != 200) {
        goBack(response.data?.messageCode)
        return
      }
      await tnmStore.setUserInfo({
        userAvatar: data.userAvatar,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      Alert.alert("Thông báo", response.data?.messageCode, [{
        text: "OK", onPress: () => {
        },
      }], { cancelable: false })
    }
  }

  const goToPage = (page) => {
    navigation.navigate((page))
  }

  const onRefresh = () => {
    setRefresh(true)
  }

  return (
    <>
      {isLoading && <Loading/>}
      <Screen style={ROOT} preset="fixed">
        {/*<View style={{ flex: 1, backgroundColor: color.palette.white }}>*/}
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps='handled'
          refreshControl={
            <RefreshControl
              refreshing={isRefresh}
              onRefresh={onRefresh}
            />
          }>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
            {/*<Screen style={ROOT} preset="scroll">*/}
            <Header
              headerText="TÀI KHOẢN"
              leftIcon="back"
              onLeftPress={() => navigation.goBack()}
              style={HEADER}
              titleStyle={HEADER_TITLE}
            />
            <View style={{ flex: 1, alignItems: "center", backgroundColor: color.palette.white }}>
              <View style={styles.topWrapper}>
                <TouchableOpacity style={styles.topLeft} onPress={() => {
                  goToPage("ChangePasswordScreen")
                }}>
                  <Feather name="unlock" size={20} color={color.palette.orange}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.avatar_large} onPress={pickImage}>
                  {data?.userAvatar ?
                    <Image
                      style={styles.tinyLogo}
                      source={{ uri: data?.userAvatar }}
                    /> :
                    <Image
                      style={styles.tinyLogo}
                      source={images.avatarDefault}
                    />
                  }
                  <View style={styles.icon_camera}>
                    <FontAwesome name="camera" size={12} color={color.palette.black}/>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.topRight} onPress={async () => {
                  await tnmStore.logout()
                  goToPage("LoginScreen")
                }}>
                  <Feather name="log-out" size={20} color={color.palette.black}/>
                </TouchableOpacity>
              </View>
              <View style={{ width: "100%", padding: 16 }}>
                <Input
                  disabled={true}
                  style={styles.input}
                  value={data.username}
                  label='Tên đăng nhập'
                />
                <Input
                  status={isSubmit && data?.firstName?.trim() == "" ? "danger" : "basic"}
                  style={styles.input}
                  value={data.firstName}
                  label='Họ và tên đệm'
                  onChangeText={nextValue => changeValueText("firstName", nextValue)}
                />
                <Input
                  status={isSubmit && data?.lastName?.trim() == "" ? "danger" : "basic"}
                  style={styles.input}
                  value={data.lastName}
                  label='Tên'
                  onChangeText={nextValue => changeValueText("lastName", nextValue)}
                />
                <Input
                  keyboardType='email-address'
                  autoCapitalize='none'
                  status={isSubmit && data?.email?.trim() == "" ? "danger" : "basic"}
                  style={styles.input}
                  value={data.email}
                  label='Email'
                  onChangeText={nextValue => changeValueText("email", nextValue)}
                />
                <Button style={{ marginTop: 8 }} onPress={() => luuThongTin()}>
                  Lưu
                </Button>
              </View>
            </View>
            {/*</Screen>*/}
          </KeyboardAvoidingView>
        </ScrollView>
        {/*</View>*/}
      </Screen>
    </>
  )
})

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  avatar_large: {
    width: layout.width / 4,
    height: layout.width / 4,
    borderRadius: layout.width / 4,
    backgroundColor: color.palette.lightGrey,
    marginVertical: 16,
    borderWidth: 2,
    borderColor: color.palette.primary,
  },
  tinyLogo: {
    width: "100%",
    height: "100%",
    borderRadius: layout.width / 4,
    borderWidth: 1,
    borderColor: color.palette.white,
  },
  container: {
    flex: 1,
  },
  icon_camera: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: color.palette.background,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  topWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-around",
  },
  topLeft: {
    marginLeft: 16,
    backgroundColor: color.palette.background,
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  topRight: {
    marginRight: 16,
    backgroundColor: color.palette.background,
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    justifyContent: "center",
    alignItems: "center",
  },
})

