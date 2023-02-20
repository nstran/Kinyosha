import * as React from "react"
import { ActivityIndicator, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, typography } from "../../theme"
import { Text } from "../text/text"
import { flatten } from "ramda"

const CONTAINER: ViewStyle = {
  justifyContent: "center",
}

const TEXT: TextStyle = {
  fontFamily: typography.primary,
  fontSize: 14,
  color: color.primary,
}

export interface LoadingProps {
  /**
   * An optional style override useful for padding & margin.
   */
  // style?: StyleProp<ViewStyle>
}

/**
 * Describe your component here
 */
export const Loading = observer(function Loading(props: LoadingProps) {
  // const { style } = props
  // const styles = flatten([CONTAINER, style])

  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={color.primary}/>
    </View>
  )
})

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    // height: 500,
    position: "absolute",
    width: "100%",
    height: "100%",
    alignContent: "center",
    zIndex: 9999,
    backgroundColor: "#80808073",
  },
})
