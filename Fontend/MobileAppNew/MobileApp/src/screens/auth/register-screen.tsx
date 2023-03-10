import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Animated, Dimensions, FlatList, StyleSheet, View, ViewStyle, Text, Image, TextInput, TouchableOpacity, Modal, Alert , Platform} from 'react-native';
import { Screen } from '../../components';
import { useIsFocused, useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import LinearGradient from 'react-native-linear-gradient';
import { images } from '../../images';
import { ScrollView } from 'react-native-gesture-handler';
import { UnitOfWorkService } from '../../services/api/unitOfWork-service';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    auth,
    firebaseDatabase,
    createUserWithEmailAndPassword,
    firebaseSet,
    firebaseDatabaseRef,
    sendEmailVerification,
    databaseStore,
    addDoc,
    collection
}
    from '../../config/firebase'
const layout = Dimensions.get('window');
const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

const _unitOfWork = new UnitOfWorkService()

export const RegisterScreen = observer(function RegisterScreen() {
    const navigation = useNavigation();
    // const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);
    const [model_term, setModel_term] = useState(false)
    const [model_thank_you, setModel_thank_you] = useState(false)
    const isFocused = useIsFocused();
    const [isRefresh, setRefresh] = useState(false);
    const [password_confirm, setPassword_confirm] = useState('')
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        password_hash: '',
        address: ''
    })

    const [passwordSecure, setPasswordSecure] = useState(true)
    const [passwordSecure01, setPasswordSecure01] = useState(true)

    useEffect(() => {
        fetchData();
    }, [isFocused, isRefresh]);
    const fetchData = async () => {
    };

    const resetData = () => {
        setFormData({
            full_name: '',
            phone_number: '',
            email: '',
            password_hash: '',
            address: ''
        })
        setPasswordSecure(true)
        setPasswordSecure01(true)
    }

    const setChangeText = (type, value) => {
        let _formData = { ...formData };
        _formData[type] = value;
        setFormData(_formData);
    };

    const showToastMessage = (text1: string) => {
        Toast.show({
            type: 'error',
            text1: text1,
            text2: null,
            visibilityTime: 2500
        });
    }

    const goToPage = (page) => {
        navigation.navigate(page);
    };

    const submit = async () => {
        if (!formData?.full_name) {
            showToastMessage('Fullname cannot be blank.')
            return
        }
        if (!formData?.phone_number) {
            showToastMessage('Cellphone cannot be blank.')
            return
        }
        if (!formData?.email) {
            showToastMessage('Email cannot be blank.')
            return
        }
        if (!formData?.password_hash) {
            showToastMessage('Password cannot be blank.')
            return
        }
        if (formData?.password_hash.length < 6 || formData?.password_hash.length > 20) {
            showToastMessage('Password must be 6-20 characters.')
            return
        }
        if (formData?.password_hash != password_confirm) {
            showToastMessage('Confirm password does not match.')
            return
        }

        let payload = {
            SignupForm: {
                full_name: formData?.full_name,
                phone_number: formData?.phone_number,
                email: formData?.email,
                password_hash: formData?.password_hash,
                address: formData?.address
            }
        }

        console.log("payload: ", payload);
        

        setLoading(true)

        let res = await _unitOfWork.user.signUp(payload)
        if (res?.status == 200) {
            addDoc(collection(databaseStore, "users"), {
                email: res?.data?.email,
                full_name: res?.data?.full_name,
                phone_number: res?.data?.phone_number,
                type: parseInt(res?.data?.type),
                created_at: res?.data?.created_at,
                id: res?.data?.id
            }).then((NewUser) => console.log("DOne!: ", NewUser))
                .catch((err) => console.log("error: ", err))
            setModel_thank_you(true)
        } else {
            showToastMessage(res?.message)
        }
        setLoading(false)

    }

    const topComponent = () => {
        return (
            <View>
                <TouchableOpacity onPress={() => {
                    resetData()
                    navigation.navigate('primaryStack')
                }
                }>
                    <Image
                        style={styles.logo}
                        source={images.logoRegister}
                    ></Image>
                </TouchableOpacity>
                <Text style={styles.textLarge}>Account Registration</Text>
                <View style={styles.containerBox}>
                    <Text style={styles.textBox}>Your Fullname
                        <Text style={{ color: 'red', fontSize: 16 }}> *</Text>
                    </Text>
                    <TextInput
                        placeholder='Name'
                        clearTextOnFocus
                        placeholderTextColor={'#c4c4c4'}
                        style={styles.containerInput}
                        value={formData.full_name}
                        onChangeText={(value) => setChangeText('full_name', value)}
                    />
                    <Text style={styles.textBox}>Your Cellphone
                        <Text style={{ color: 'red', fontSize: 16 }}> *</Text>
                    </Text>
                    <TextInput
                        placeholder='Phone'
                        placeholderTextColor={'#c4c4c4'}
                        style={styles.containerInput}
                        keyboardType='phone-pad'
                        value={formData.phone_number}
                        onChangeText={(value) => setChangeText('phone_number', value)}
                    />
                    <Text style={styles.textBox}>Your Email(account login)
                        <Text style={{ color: 'red', fontSize: 16 }}> *</Text>
                    </Text>
                    <TextInput
                        placeholder='Email'
                        style={styles.containerInput}
                        autoCapitalize="none"
                        placeholderTextColor={'#c4c4c4'}
                        autoComplete="email"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(value) => setChangeText('email', value)}
                    />
                    <Text style={styles.textBox}>Password (6-20 characters)
                        <Text style={{ color: 'red', fontSize: 16 }}> *</Text>
                    </Text>
                    <View style={[styles.containerInput, { paddingHorizontal: 14, paddingVertical: 0 }]}>
                        <TextInput
                            placeholder='Password'
                            style={[{ width: '78%', fontSize: 15, color: color.black}, Platform.OS == 'ios' ? {marginTop: 12} : {}]}
                            autoCapitalize="none"
                            placeholderTextColor={'#c4c4c4'}
                            autoComplete="password"
                            value={formData.password_hash}
                            secureTextEntry={passwordSecure}
                            onChangeText={(value) => setChangeText('password_hash', value)}
                        />
                        <TouchableOpacity style={styles.eye} onPress={() => setPasswordSecure(!passwordSecure)}>
                            <Ionicons name={passwordSecure ? 'eye-off-outline' : 'eye-outline'} color="black" size={20} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.textBox}>Confirm Password (6-20 characters)
                        <Text style={{ color: 'red', fontSize: 16 }}> *</Text>
                    </Text>
                    <View style={[styles.containerInput, { paddingHorizontal: 14, paddingVertical: 0 }]}>
                        <TextInput
                            placeholder='Confirm password'
                            placeholderTextColor={'#c4c4c4'}
                            style={[{ width: '78%', fontSize: 15, color: color.black}, Platform.OS == 'ios' ? {marginTop: 12} : {}]}
                            autoCapitalize="none"
                            autoComplete="password"
                            secureTextEntry={passwordSecure01}
                            value={password_confirm}
                            onChangeText={(password_confirm) => setPassword_confirm(password_confirm)}
                        />
                        <TouchableOpacity style={styles.eye} onPress={() => setPasswordSecure01(!passwordSecure01)}>
                            <Ionicons name={passwordSecure01 ? 'eye-off-outline' : 'eye-outline'} color="black" size={20} />
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.containerText}>
                    <Text style={styles.textSmall}>By clicking the sign up button, you agree by default WorkSify
                        <Text onPress={() => setModel_term(true)} style={styles.textMediumRegister}> Terms of Service</Text>
                        {/* style={styles.row} */}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={submit}
                    style={styles.containerButton}>
                    <Text style={styles.textBtn}>REGISTER</Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Already got an account?</Text>
                    <TouchableOpacity
                        style={styles.footerLink}
                        onPress={() =>{
                            resetData()
                            goToPage('LoginScreen')
                        }}
                    >
                        <Text style={styles.textFooterLink}>Log in</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    };
    return (
        <>
            {isLoading && <CenterSpinner />}
            <Screen style={ROOT} preset="fixed">
                <View style={styles.container}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'dashboard-' + index + String(item)}
                    />
                </View>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={model_term}
                    onRequestClose={() => {
                    }}
                >
                    <View style={styles.modal_container}>
                        <Text style={[{ fontWeight: '700', fontSize: 16, color: '#000000', lineHeight: 19.2 }, styles.text]}>??I???U KHO???N S??? D???NG</Text>
                        <FlatList
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            style={{ flex: 1, }}
                            renderItem={null}
                            data={[]}
                            ListEmptyComponent={() => {
                                return (
                                    <View style={{ paddingVertical: 15 }}>

                                        <ScrollView>
                                            <Text style={[{ fontWeight: '400', fontSize: 15, color: '#000000', lineHeight: 22 }, styles.text]}>Worksify, hi???n di???n t???i t??n mi???n Worksify.vn, l?? m???t trang web ho??n to??n mi???n ph?? d??nh cho c??c t??? ch???c, c?? nh??n ????ng t???i v?? t??m ki???m tin t???c vi???c l??m. Worksify ch??? ch???p nh???n ????ng t???i c??c th??ng tin tuy???n d???ng c???a c??c t??? ch???c c?? nhu c???u tuy???n d???ng v?? tr???c ti???p s??? d???ng ???ng vi??n sau khi tuy???n. M???i ngo???i l??? s??? ???????c Worksify xem x??t v?? quy???t ?????nh n???u th???y h???p l??.

                                                {'\n'}{'\n'}Truy c???p v?? s??? d???ng c??c d???ch v??? t???i Worksify ?????ng ngh??a v???i vi???c t??? ?????ng ch???p thu???n c??c quy ?????nh c???a Worksify. Worksify, v???i n??? l???c ph?? h???p nh???t c?? th???, s??? ph??t tri???n, v???n h??nh, duy tr?? n???i dung ???????c ????ng t???i m???t c??ch ch??nh x??c nh???t c?? th???.

                                                {'\n'}{'\n'}Tuy nhi??n, Worksify kh??ng b???o ?????m v?? cam k???t v??? s??? ch??nh x??c ho???c ch???u tr??ch nhi???m v??? th??ng tin n???i dung ???????c ????ng t???i t???i web site n??y. Worksify kh??ng ch???u tr??ch nhi???m v??? nh???ng thi???t h???i, nh???ng h???u qu??? t??? vi???c ph??? thu???c v??o th??ng tin c???a web site n??y. M???i th??ng tin, n???i dung c???a web site n??y c?? th??? ???????c qu???n tr??? vi??n thay ?????i b???t c??? l??c n??o m?? kh??ng c???n th??ng b??o.

                                                {'\n'}{'\n'}Worksify kh??ng ?????m b???o m???i t??nh n??ng k??? thu???t v?? d???ch v??? c???a website n??y l?? kh??ng b??? tr???c tr???c ho???c kh??ng gi??n ??o???n, c??c l???i ???????c s???a ch???a, h??? th???ng m??y ch??? l?? kh??ng b??? ???nh h?????ng b???i virus ho???c c??c v???n ????? ???nh h?????ng.

                                                {'\n'}{'\n'}Worksify kh??ng ?????m b???o vi???c s??? d???ng web site s??? ?????m b???o cho t??? ch???c tuy???n d???ng c?? th??? tuy???n d???ng th??nh c??ng ???????c ai ???? c??ng nh?? ng?????i t??m vi???c ch???c ch???n t??m ???????c c??ng vi???c th??ng qua Worksify ho???c nh???n ???????c ph???n h???i c???a t??? ch???c tuy???n d???ng.

                                                {'\n'}{'\n'}H??y s??? d???ng web site n??y v???i s??? th???n tr???ng v?? t??? ch???u m???i r???i ro.
                                            </Text>
                                        </ScrollView>

                                    </View>
                                )
                            }}
                            keyExtractor={(item, index) => 'term-modal' + index + String(item)}
                        />
                        <TouchableOpacity
                            style={{ height: 55, marginBottom: '10%', marginTop: 20, backgroundColor: '#41B1DF', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setModel_term(false)}>
                            <Text style={[{ fontWeight: '700', fontSize: 20, color: color.white }, styles.text]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={model_thank_you}
                    onRequestClose={() => {
                    }}
                >
                    <View style={styles.modal_container}>
                        <Image
                            source={images.modal_thank_you}
                        />

                        <TouchableOpacity
                            style={{ height: 55, marginBottom: '10%', marginTop: 20, backgroundColor: '#41B1DF', borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                setModel_thank_you(false)
                                setRefresh(true)
                                resetData()
                                goToPage('LoginScreen')
                            }
                            }>
                            <Text style={[{ fontWeight: '700', fontSize: 20, color: color.white }, styles.text]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#182954',
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 18,
        // fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    logo: {
        width: 65,
        height: 65,
        marginTop: 10,
        alignSelf: 'center'
    },
    textLarge: {
        color: 'white',
        fontSize: 19,
        marginTop: 5,
        marginLeft: '5%',
        fontWeight: '500',
        alignSelf: 'center',
    },
    containerBox: {
        // height: '55%',
        width: '90%',
        marginLeft: '5%',
        marginTop: 10,
        flexDirection: 'column',
        borderColor: 'white',
        border: 2,
    },
    textBox: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    containerInput: {
        height: 44,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 13,
        paddingHorizontal: 15,
        fontSize: 16,
        marginTop: 10,
        color: color.black
    },
    textMediumFW: {
        color: 'white',
        fontSize: 17,
        marginTop: 20,
        left: '60%',
        fontWeight: '500',
    },
    containerButton: {
        height: 50,
        width: '90%',
        marginLeft: '5%',
        marginTop: 10,
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        // marginBottom: '20%'
    },
    textBtn: {
        color: '#41B1DF',
        fontSize: 20,
        fontWeight: '700'
    },
    containerText: {
        height: '8%',
        width: '94%',
        marginLeft: '3%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    textSmall: {
        color: '#c0bccc',
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 24,
    },
    textMediumRegister: {
        color: '#41B1DF',
        fontSize: 16,
    },
    modal_container: {
        backgroundColor: color.white,
        width: 335,
        height: 570,
        marginTop: 50,
        borderRadius: 20,
        padding: 20,
        alignSelf: 'center',
    },
    eye: {
        position: 'absolute',
        right: 12,
        top: 10,
    },
    footerView: {
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        width: '60%',
        marginLeft: '20%',
        marginRight: '20%',
        height: 40,
        marginTop: 16,
        marginBottom: 10
    },
    footerText: {
        fontSize: 14,
        color: '#c0bccc',
    },
    footerLink: {
        marginLeft: '2%',
    },
    textFooterLink: {
        fontSize: 17,
        color: 'white',
        fontWeight: "bold",
    }

});
