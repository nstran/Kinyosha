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
                        <Text style={[{ fontWeight: '700', fontSize: 16, color: '#000000', lineHeight: 19.2 }, styles.text]}>ĐIỀU KHOẢN SỬ DỤNG</Text>
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
                                            <Text style={[{ fontWeight: '400', fontSize: 15, color: '#000000', lineHeight: 22 }, styles.text]}>Worksify, hiện diện tại tên miền Worksify.vn, là một trang web hoàn toàn miễn phí dành cho các tổ chức, cá nhân đăng tải và tìm kiếm tin tức việc làm. Worksify chỉ chấp nhận đăng tải các thông tin tuyển dụng của các tổ chức có nhu cầu tuyển dụng và trực tiếp sử dụng ứng viên sau khi tuyển. Mọi ngoại lệ sẽ được Worksify xem xét và quyết định nếu thấy hợp lý.

                                                {'\n'}{'\n'}Truy cập và sử dụng các dịch vụ tại Worksify đồng nghĩa với việc tự động chấp thuận các quy định của Worksify. Worksify, với nỗ lực phù hợp nhất có thể, sẽ phát triển, vận hành, duy trì nội dung được đăng tải một cách chính xác nhất có thể.

                                                {'\n'}{'\n'}Tuy nhiên, Worksify không bảo đảm và cam kết về sự chính xác hoặc chịu trách nhiệm về thông tin nội dung được đăng tải tại web site này. Worksify không chịu trách nhiệm về những thiệt hại, những hậu quả từ việc phụ thuộc vào thông tin của web site này. Mọi thông tin, nội dung của web site này có thể được quản trị viên thay đổi bất cứ lúc nào mà không cần thông báo.

                                                {'\n'}{'\n'}Worksify không đảm bảo mọi tính năng kỹ thuật và dịch vụ của website này là không bị trục trặc hoặc không gián đoạn, các lỗi được sửa chữa, hệ thống máy chủ là không bị ảnh hưởng bởi virus hoặc các vấn đề ảnh hưởng.

                                                {'\n'}{'\n'}Worksify không đảm bảo việc sử dụng web site sẽ đảm bảo cho tổ chức tuyển dụng có thể tuyển dụng thành công được ai đó cũng như người tìm việc chắc chắn tìm được công việc thông qua Worksify hoặc nhận được phản hồi của tổ chức tuyển dụng.

                                                {'\n'}{'\n'}Hãy sử dụng web site này với sự thận trọng và tự chịu mọi rủi ro.
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
