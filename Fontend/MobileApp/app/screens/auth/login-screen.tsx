import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Animated,ActivityIndicator, Dimensions, FlatList, StyleSheet, View, ViewStyle, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert, BackHandler, Platform } from 'react-native';
import { Screen } from '../../components';
import { useFocusEffect, useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import LinearGradient from 'react-native-linear-gradient';
import { images } from '../../images';
import { UnitOfWorkService } from '../../services/api/unitOfWork-service';
import { StorageKey, Storage } from "../../services/storage/index"
import Toast from 'react-native-toast-message';
import { regexString } from '../../services';
import { useStores } from '../../models';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const _unitOfWork = new UnitOfWorkService()

const layout = Dimensions.get('window');
const ROOT: ViewStyle = {
    backgroundColor: '#00ADE9',
    flex: 1,
};

const TOAST_MESSAGE = {
    messageAll: 'Username and Password cannot be blank!',
    messageUsername: 'Username cannot be blank!',
    messagePassword: 'Password cannot be blank!',
    messageContent: 'Please enter in the blank!'
}

export const LoginScreen = observer(function LoginScreen() {
    const navigation = useNavigation();
    const { kinyoshaModel } = useStores();
    const [isLoading, setLoading] = useState(false);
    const [isSubmit, setSubmit] = useState(false)
    const [isRefresh, setRefresh] = useState(false);
    const isFocused = useIsFocused();
    const { params }: any = useRoute();


    const [formData, setFormData] = useState<any>({
        username: "",
        password: "",
        passwordSecure: true,
    })

    const [passwordSecure, setPasswordSecure] = useState(true)

    useEffect(() => {
      setFormData({
        username: "",
        password: "",
        passwordSecure: true,
    })
    },[isFocused]);

    useEffect(() => {
        onGetTokenDevice()
    },[isFocused])

    const onGetTokenDevice = async () => {
        console.log('onGetTokenDevice');
       
    }

    // useEffect(() => {
    //     return notifee.onForegroundEvent(({ type, detail }) => {
    //         switch (type) {
    //           case EventType.DISMISSED:
    //             console.log('User dismissed notification', detail.notification);
    //             break;
    //           case EventType.PRESS:
    //             console.log('User pressed notification', detail.notification);
    //             break;
    //         }
    //       });
    // },[]);




    const submit = async () => {
        if (checkSubmit()) {           
            // try {
            //     const q = query(collection(databaseStore, "users"), where("email", "==", formData?.username))
            //     const querySnapshot = await getDocs(q);
            //     querySnapshot.forEach(async (doc) => {
            //         await _unitOfWork.storage.setItem(StorageKey.ID_FIREBASE, doc.id)
            //     });
            // } catch (error) {
            //     console.log("Error firebase: ", error)
            // }
            setLoading(true)
            const deviceToken = await _unitOfWork.storage.getItem(StorageKey.DEVICE_TOKEN)
            console.log('deviceToken',deviceToken);
            
            let payload = {
                // username: formData?.username,
                // password: formData?.password , 
                 User:{UserName: formData?.username, Password:formData?.password, Active:true, CreatedById:"de2d55bf-e224-4ada-95e8-7769ecc494ea"}}
           
            //let response ={ status : 100, message:'', user:'thuan', token:'12343433', user:{ full_name:'Thuan Nguyen', email:'thuangiang@gmail.com'}} 
            let response =  await _unitOfWork.user.login(payload)           
            if (response?.status == 200) {               
                setRefresh(false)
                showToastMessage(response?.message, null)
            } else {

                if(response !=null && response.currentUser !=null)   {       
                            
                setRefresh(true)
                await _unitOfWork.storage.setItem(StorageKey.USERNAME, formData?.username)
                await _unitOfWork.storage.setItem(StorageKey.PASSWORD, formData?.password)
                await _unitOfWork.storage.setItem(StorageKey.ID, response.currentUser.userId)
                await _unitOfWork.storage.setItem(StorageKey.TOKEN, response.currentUser.token)
                await _unitOfWork.storage.setItem(StorageKey.FULL_NAME, response.userFullName)
                await _unitOfWork.storage.setItem(StorageKey.EMAIL, response.currentUser.email) 
                await _unitOfWork.storage.setItem(StorageKey.USER_AVATAR, response.userAvatar)               
                                                            
                    navigation.navigate('primaryStack')               
                }                
            }
            setLoading(false)
        }

    }
    const checkSubmit = () => {
        
        setSubmit(true)
        if (formData?.username?.length == 0 && formData?.password?.length == 0) {
            showToastMessage(TOAST_MESSAGE.messageAll, TOAST_MESSAGE.messageContent);
            return false;
        }
        if (formData?.username?.length == 0) {
            showToastMessage(TOAST_MESSAGE.messageUsername, TOAST_MESSAGE.messageContent);
            return false;
        }
        if (formData?.password?.length == 0) {
            showToastMessage(TOAST_MESSAGE.messagePassword, TOAST_MESSAGE.messageContent);
            return false;
        }
        setRefresh(true)
        return true
    }

    const showToastMessage = (text1: string, text2: string) => {
        Toast.show({
            type: 'error',
            text1: text1,
            text2: text2
        });
    }

    const setChangeText = (type, value) => {
        let _formData = { ...formData }
        _formData[type] = value
        setFormData(_formData)
    }



    const goToPage = (page) => {
        navigation.navigate(page);
    };

    const topComponent = () => {
        return (
            <KeyboardAvoidingView style={styles.container}>
                <Image style={{ position: 'absolute' }} source={images.BGLoginLeft} />
                <TouchableOpacity onPress={() => {
                    navigation.navigate('primaryStack')
                }
                }>
                    <Image
                        style={styles.logo}
                        source={images.logoRegister}
                    ></Image>
                </TouchableOpacity>              
                <View style={styles.containerBox}>

                    <View style={[styles.inputSection]}>                      
                       {/* <Ionicons name={'user-o'} color="gray" size={42}/> */}                      
                       <FontAwesome name={'user-o'} size={42} color='gray'/>  
                        <TextInput
                            onChangeText={(value) => {
                                setChangeText("username", value)
                            }}
                            value={formData?.userName}
                            style={styles.input}
                            placeholder='Tài khoản'
                            autoCapitalize="none"
                            placeholderTextColor={'#c4c4c4'}
                            autoComplete="email"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={[styles.inputSection]}>
                    <Ionicons name={'lock-closed-outline'} color="gray" size={42}/>
                        <TextInput
                            onChangeText={(value) => {
                                setChangeText("password", value)
                            }}
                            style={styles.input}
                            value={formData?.password}
                            placeholder='Mật khẩu'
                            placeholderTextColor={'#c4c4c4'}
                            autoCapitalize="none"
                            autoComplete="password"
                            secureTextEntry={passwordSecure}
                        />
                        <TouchableOpacity style={styles.eye} onPress={() => setPasswordSecure(!passwordSecure)}>
                            <Ionicons name={passwordSecure ? 'eye-off-outline' : 'eye-outline'} color="black" size={40} />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* <TouchableOpacity
                    onPress={() => goToPage('ForgotPWScreen')}
                    style={{
                        marginTop: 20,
                        left: '60%',
                    }}>
                    <Text style={styles.textMediumFW}>Forgot password?</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    onPress={submit}
                    style={styles.containerButton}
                >
                  
                    <Text style={styles.textBtn}>LOGIN</Text>
                </TouchableOpacity>
                {/* <View style={styles.containerText}>
                    <Text style={styles.textSmall}>Don't have account?</Text>
                    <TouchableOpacity
                        onPress={() => goToPage('RegisterScreen')}
                    >
                        <Text style={styles.textMediumRegister}> Register now</Text>
                    </TouchableOpacity>
                </View> */}
            </KeyboardAvoidingView>
        );
    };
    return (
        <>
            {isLoading && <CenterSpinner />}
            <Screen style={ROOT} preset="fixed">
                <View style={{ flex: 1 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{ flex: 1 }}
                        renderItem={null}
                        data={[]}
                        ListHeaderComponent={topComponent()}
                        keyExtractor={(item, index) => 'profile-' + index + String(item)}
                    />
                </View>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00ADE9',
        padding: 10
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
        width:200,
        height: 120,
        marginTop: 30,
        alignSelf: 'center'
    },
    textLarge: {
        color: '#01B1EB',
        fontSize: 24,
        marginTop: 10,
        marginLeft: '5%',
        fontWeight: '500',
    },
    containerBox: {
        width: '60%',
        marginTop: 74,
        flex: 1,
        alignSelf: 'center',      
    },
    containerInput: {
        height: 44,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        // padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    textMediumFW: {
        color: 'white',
        fontSize: 17,
        fontWeight: '500',
    },
    containerButton: {
        height: 70,
        width: 320,
        marginLeft: '5%',
        marginTop: 60,
        borderRadius: 10,
        backgroundColor: '#2355FF',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf:"center"
    },
    textBtn: {
        color: color.white,
        fontSize: 24,
        fontWeight: '900',     
    },
    containerText: {
        height: '10%',
        width: '60%',
        marginLeft: '20%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom:10
    },
    textSmall: {
        color: '#c0bccc',
        fontSize: 15,
    },
    textMediumRegister: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    eye: {
        position: 'absolute',
        right: 12,
        top: 10,
    },
    input: {
        flex: 1,
        fontSize: 24,
        height: 51,
        paddingTop: 10,
        paddingRight: 20,
        paddingBottom: 10,
        paddingLeft: 0,
        borderRadius: 12, marginRight:40,
        backgroundColor: color.white,
        color: '#424242',
    },
    inputSection: {
        flex: 1,
        alignSelf: "center",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',        
        backgroundColor: '#fff',
        marginTop: 15,
        borderWidth: 1,        
        borderRadius: 7,
        borderColor: '#AEBA98',
        minHeight: 56,
        maxHeight: 56,
    },
});
