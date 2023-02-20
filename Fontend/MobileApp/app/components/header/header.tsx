import React from "react"
import { View, ViewStyle, TextStyle, Image, TouchableOpacity } from "react-native"
import { HeaderProps } from "./header.props"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Icon } from "../icon/icon"
import { color, spacing } from "../../theme"
import { translate } from "../../i18n/"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { useStores } from "../../models"
import { images } from "../../images"

// static styles
const ROOT: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: spacing[4],
  alignItems: "center",
  paddingTop: spacing[5],
  paddingBottom: spacing[5],
  justifyContent: "flex-start",
}
const TITLE: TextStyle = { textAlign: "center" }
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: "center" }
const LEFT: ViewStyle = { width: 32 }
const RIGHT: ViewStyle = { width: 32 }
const ICON: TextStyle = {
  color: color.palette.lightGrey,
}

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export function Header(props: HeaderProps) {
  const {
    onLeftPress,
    onRightPress,
    iconStyle,
    rightIcon,
    leftIcon,
    headerText,
    headerTx,
    style,
    titleStyle,
  } = props
  const header = headerText || (headerTx && translate(headerTx)) || ""
  const { tnmStore } = useStores()
  const { auth, userInfo } = tnmStore

  return (
    <View style={[ROOT, style]}>
      {leftIcon ? (
        leftIcon == "avatar" ?
          <Button preset="link" onPress={onLeftPress}>
            {
              userInfo?.userAvatar ?
                <Image resizeMode="cover" style={{
                  width: 24,
                  height: 24,
                  borderRadius: 24 / 2,
                }} source={{ uri: userInfo?.userAvatar }}/> :
                <Image resizeMode="cover" style={{
                  width: 24,
                  height: 24,
                  borderRadius: 24 / 2,
                }} source={images.avatarDefault}/>
            }
          </Button> :
          <View>
            <Button
              style={{ width: 32 }}
              preset="link" onPress={onLeftPress}>
              <Icon icon={leftIcon}/>
            </Button>
            <TouchableOpacity
              onPress={onLeftPress}
              style={{
                position: "absolute", top: -8, width: 40, height: 40,
                // backgroundColor: "red",
              }}/>
          </View>
      ) : (
        <View style={LEFT}/>
      )}
      <View style={TITLE_MIDDLE}>
        <Text style={[TITLE, titleStyle]} text={header}/>
      </View>
      {rightIcon ? (
        <View>
          <Button
            // style={{ width: 32 }}
            preset="link" onPress={onRightPress}>
            <FontAwesomeIcon icon={rightIcon} style={{ ...ICON, ...iconStyle }}/>
          </Button>
          <TouchableOpacity
            onPress={onRightPress}
            style={{
              position: "absolute", top: -8, width: 40, height: 40, right: 0,
              // backgroundColor: "red",
            }}/>
        </View>
      ) : (
        <View style={RIGHT}/>
      )}
    </View>
  )
}
