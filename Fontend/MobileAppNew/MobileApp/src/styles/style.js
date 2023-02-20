import {StyleSheet} from "react-native"
import {color} from "../theme";

export const styles = StyleSheet.create({
    tab: {},
    tab_content: {
        width: "100",
        flex: 1,
        backgroundColor: "red"
    },
    button: {
        margin: 2,
    },
    red: {
        color: "red",
    },
    white: {
        color: "white",
    },
    bold: {
        fontWeight: "bold",
    },
    align_center: {
        alignSelf: "center",
    },
    appButtonContainer: {
        borderWidth: 1,
        borderColor: "#991D1D",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 18,
        fontWeight: "600",
    },
    show_all_btn: {
        width: "90%",
        alignSelf: "center",
        marginBottom: 30,
    },
    appButtonText: {
        fontSize: 16,
        color: "#991D1D",
        alignSelf: "center",
        lineHeight: 19,
    },
    appButtonTextDefault: {
        fontSize: 16,
        color: "rgba(105, 112, 119, 1)",
        alignSelf: "center",
        lineHeight: 19,
    },
    red_btn: {
        color: "#991D1D",
        borderColor: "#991D1D",
        fontWeight: "bold",
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    col: {
        flexDirection: 'column',
    },
    col_left: {
        flex: 1,
        flexDirection: 'row'
    },
    col_right: {
        justifyContent: 'space-evenly',
        marginVertical: 10
    },
    pagerView: {
        flex: 1,
        height: 550
    },
    pagerView1: {
        flex: 1,
        height: 600
    },
    arror_right: {
        width: 25,
        height: 30,
        resizeMode: 'contain'
    },
    paging: {
        alignSelf: "center",
        alignItems: "center",
        height: 50,
        width: 220,
        marginBottom: 20,
    },
    page_item: {
        marginLeft: 15,
    },
    page_no: {
        fontSize: 14,
    },
    outline_btn: {
        borderWidth: 1,
        borderColor: "rgba(105, 112, 119, 1)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 18,
        fontWeight: "600",
    },

    small_btn: {
        paddingVertical: 5,
    },
    ml1: {
        marginLeft: 10,
    },
    mt1: {
        marginTop: 10,
    },
    mt2: {
        marginTop: 20,
    },
    mt3: {
        marginTop: 30,
    },
    mr1: {
        marginRight: 10,
    },
    mb1: {
        marginBottom: 10,
    },
    inputSectionSm: {
        flex: 1,
        alignSelf: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 7,
        borderColor: "#A23232",
        minHeight: 50,
    },
    inputSection: {
        flex: 1,
        alignSelf: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 7,
        borderColor: color.primary,
        minHeight: 56,
        maxHeight: 56,
    },
    inputStartIcon: {
        width: 22,
        height: 22,
        // resizeMode: "contain",
        margin: 15,
        color: "#9098B1",
    },
    inputEndIcon: {
        width: 22,
        height: 22,
        margin: 15,
        // resizeMode: "contain",
        color: "#9098B1",
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        backgroundColor: '#fff',
        color: '#424242',
    },
    divider: {
        backgroundColor: '#EBF0FF', height: 1, flex: 1, alignSelf: 'center', marginHorizontal: 10
    },
    divider_text: {
        alignSelf: 'center', paddingHorizontal: 5, fontSize: 16, color: "#9098B1", fontWeight: "bold"
    },

    //Đức Nguyễn Chung (ducdz)
    imgFull: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'contain'
    },
    imgCover: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    },
    mt1p: {
        marginTop: '1%'
    },
    mt2p: {
        marginTop: '2%'
    },
    mt3p: {
        marginTop: '3%'
    },
    mt4p: {
        marginTop: '4%'
    },
    ml1p: {
        marginLeft: '1%'
    },
    ml2p: {
        marginLeft: '2%'
    },
    ml3p: {
        marginLeft: '3%'
    },
    ml4p: {
        marginLeft: '4%'
    },
    mr1p: {
        marginRight: '1%'
    },
    mr2p: {
        marginRight: '2%'
    },
    mr3p: {
        marginRight: '3%'
    },
    mr4p: {
        marginRight: '4%'
    },
    mb1p: {
        marginBottom: '1%'
    },
    mb2p: {
        marginBottom: '2%'
    },
    mb3p: {
        marginBottom: '3%'
    },
    mb4p: {
        marginBottom: '4%'
    },
    _row: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: "wrap",
    },
    _col: {
        flex: 1,
    },
    _red: {
        color: '#991D1D',
    },
    bgRed: {
        backgroundColor: '#991D1D',
    },
    link: {
        textDecorationLine: "underline",
    },
    w_100: {
        width: '100%'
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        height: 500,
        position: "absolute",
        width: "100%",
        height: "100%",
        alignContent: "center",
        zIndex: 1000,
        backgroundColor: "#80808073",
    },
    //=========================================================================
    tab_content: {
        width: "100",
        flex: 1,
        backgroundColor: "red"
    },
    button: {
        margin: 2,
    },
    red: {
        color: "red",
    },
    white: {
        color: "white",
    },
    bold: {
        fontWeight: "bold",
    },
    align_center: {
        alignSelf: "center",
    },
    appButtonContainer: {
        borderWidth: 1,
        borderColor: "#991D1D",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 18,
        fontWeight: "600",
    },
    show_all_btn: {
        width: "90%",
        alignSelf: "center",
        marginBottom: 30,
    },
    appButtonText: {
        fontSize: 16,
        color: "#991D1D",
        alignSelf: "center",
        lineHeight: 19,
    },
    appButtonTextDefault: {
        fontSize: 16,
        color: "rgba(105, 112, 119, 1)",
        alignSelf: "center",
        lineHeight: 19,
    },
    red_btn: {
        color: "#991D1D",
        borderColor: "#991D1D",
        fontWeight: "bold",
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    col_left: {
        flex: 1,
        flexDirection: 'row'
    },
    col_right: {
        justifyContent: 'space-evenly',
        marginVertical: 10
    },
    pagerView: {
        flex: 1,
        height: 550
    },
    pagerView1: {
        flex: 1,
        // height: 600
    },
    arror_right: {
        width: 25,
        height: 30,
        resizeMode: 'contain'
    },
    paging: {
        alignSelf: "center",
        alignItems: "center",
        height: 50,
        width: 220,
        marginBottom: 20,
    },
    page_item: {
        marginLeft: 15,
    },
    page_no: {
        fontSize: 14,
    },
    outline_btn: {
        borderWidth: 1,
        borderColor: "rgba(105, 112, 119, 1)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 18,
        fontWeight: "600",
    },

    small_btn: {
        paddingVertical: 5,
    },
    ml1: {
        marginLeft: 10,
    },
    mt1: {
        marginTop: 10,
    },
    mt2: {
        marginTop: 20,
    },
    mt3: {
        marginTop: 30,
    },
    mr1: {
        marginRight: 10,
    },
    mb1: {
        marginBottom: 10,
    },
    inputStartIcon: {
        width: 22,
        height: 22,
        // resizeMode: "contain",
        marginHorizontal: 15,
        marginVertical: 10,
        // color: "#9098B1",
    },
    inputEndIcon: {
        width: 24,
        height: 24,
        marginHorizontal: 15,
        marginVertical: 10,
        // resizeMode: "contain",
        color: "#9098B1",
        zIndex: 1,
    },
    input: {
        flex: 1,
        fontSize: 14,
        // paddingTop: 10,
        paddingRight: 10,
        // paddingBottom: 10,
        paddingLeft: 0,
        marginVertical: 0,
        backgroundColor: '#fff',
        color: '#424242',
        height: 35,
    },
    input2: {
        flex: 1,
        fontSize: 14,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        marginHorizontal: 15,
        backgroundColor: '#fff',
        // minHeight: 40,
        color: '#424242',
    },
    divider: {
        backgroundColor: '#EBF0FF', height: 1, flex: 1, alignSelf: 'center', marginHorizontal: 10
    },
    divider_text: {
        alignSelf: 'center', paddingHorizontal: 5, fontSize: 16, color: "#9098B1", fontWeight: "bold"
    },
    inputIOS: {
        fontSize: 13,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 0,
        marginTop: 2,
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        minWidth: "100%",
    },
    genderInputIOS: {
        fontSize: 14,
        paddingVertical: 11,
        paddingHorizontal: 26,
        marginTop: 9,
        color: '#757577',
        minWidth: "100%",
        marginHorizontal: -26,
        borderRadius: 4,
    },
      genderInputIOS2: {
        fontSize: 14,
        paddingVertical: 6,
        paddingHorizontal: 26,
        marginTop: 9,
        color: '#757577',
        minWidth: "100%",
        marginHorizontal: -26,
        borderRadius: 4,
      },
    inputAndroid: {
        fontSize: 13,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginTop: 12,
        borderWidth: 0,
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        minWidth: "100%",
    },
});
