// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions, Text } from 'react-native';
import { DrawerActions, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
 import {logout} from '../services/index';
 
import { useStores } from '../models';
import { images } from '../images';
import { color } from '../theme';
import { UnitOfWorkService } from '../services/api/unitOfWork-service';
import { ListItem } from '@ui-kitten/components';
import { StorageKey } from '../services/storage/index'
const _unitOfWork = new UnitOfWorkService()

const layout = Dimensions.get('window');

export function SidebarDrawer(props: any) {
    const navigation = useNavigation();
    const [userId, setUserId] = useState('')
    const [email, setEmail] = useState('')
    const isFocused = useIsFocused()
    const [isRefresh, setRefresh] = useState(false)
    const {workSifyModel} = useStores();
    const [isShowSetting,setIsShowSetting] = useState<boolean>(true);

    let {timeReload} = props

    useEffect(() => {
        fetchData()
    }, [isFocused,isRefresh,timeReload])

    const fetchData = async () => {
        setRefresh(false)
        let userId = await _unitOfWork.storage.getItem(StorageKey.ID)
        const type = await _unitOfWork.storage.getItem(StorageKey.TYPE)    
        let email = await _unitOfWork.storage.getItem(StorageKey.EMAIL)
        if(type === 1) {
            setIsShowSetting(false)
        }
        setUserId(userId)
        setEmail(email)
    }

    const toggleMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const logout_app = async() =>{
                await _unitOfWork.storage.removeItem(StorageKey.USERNAME)
                await _unitOfWork.storage.removeItem(StorageKey.PASSWORD)
                await _unitOfWork.storage.removeItem(StorageKey.ID)
                await _unitOfWork.storage.removeItem(StorageKey.TOKEN)
                await _unitOfWork.storage.removeItem(StorageKey.FULL_NAME)
                await _unitOfWork.storage.removeItem(StorageKey.EMAIL)                
    }
    const goToPage = (page: any) => {
        navigation.navigate(page);
    };

    const closeSideBar = async () => {
        navigation.dispatch(DrawerActions.closeDrawer());
    };

    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: '#F2F2F2', width: 320 }}>
            <View style={{ flex: 1, height: layout.height, width: layout.width }}>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center',marginRight:30 }}>
                        <Image resizeMode='contain' source={images.logo} style={{ width: 240, }} />                    
                    </View>
                    <TouchableOpacity onPress={closeSideBar}>
                        <Ionicons name={'close-outline'} color='black' size={30} />
                    </TouchableOpacity>

                </View>
                {/* not login */}
                {!userId ?
                    <View>
                        <View style={{ backgroundColor: '#182954', opacity: 0.05, height: 1 }}></View>
                        <TouchableOpacity style={styles.item_setting}
                            onPress={async () => {
                                // auth.signOut()
                                // closeSideBar()
                                // await _unitOfWork.storage.logout()
                                logout()
                                closeSideBar()
                                // goToPage('LoginScreen')
                            }}>
                            <Text style={[styles.text_header2]}>Danh sách sản phẩm</Text>
                            <Ionicons name={'chevron-forward-outline'} size={24} />
                        </TouchableOpacity>
                        <View style={{ backgroundColor: '#182954', opacity: 0.05, height: 1 }}></View>
                        <TouchableOpacity style={styles.item_setting}
                            onPress={() => {
                                closeSideBar()
                                Register_Screen()
                                // goToPage('RegisterScreen')
                            }} >
                            <Text style={[styles.text_header2]}>Chi tiết lô</Text>
                            <Ionicons name={'chevron-forward-outline'} size={24} />
                        </TouchableOpacity>
                    </View>
                    :

                    <View>
                        <View style={{ backgroundColor: '#182954', opacity: 0.05, height: 1 }}></View>
                        <TouchableOpacity style={styles.item_setting}
                            onPress={async () => {
                                logout_app()
                                logout();
                                // navigation && navigation.navigate("LoginScreen");
                              //  closeSideBar()
                              //  await _unitOfWork.storage.logout()
                               // setRefresh(true)
                                
                               // navigation.navigate('Main', {screen: "DashboardScreen", params: {reloadHeader: new Date().getTime()}})
                               
                            }}>
                            <View style={{flexDirection:'column'}}>
                                <Text style={[styles.text_header2]}>Đăng xuất</Text>
                                <Text style={{marginTop:5, color: color.text_naunhat,fontWeight: '600'}}>{email}</Text>
                            </View>
                            <Ionicons name={'chevron-forward-outline'} size={24} />
                        </TouchableOpacity>
                    </View>
                }

                {isShowSetting && <>
                <View style={{ backgroundColor: '#182954', opacity: 0.05, height: 1 }}></View>
                <TouchableOpacity style={styles.item_setting} onPress={() => goToPage('SettingScreen')}>
                    <Text style={[styles.text_header2]}>Chi tiết công đoạn</Text>
                    <Ionicons name={'chevron-forward-outline'} size={24} />
                </TouchableOpacity>
                </>}
            </View>
        </DrawerContentScrollView>

    );
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 32,
        marginTop: 46 + 32,
        // backgroundColor: 'green',
    },
    header: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#F9F9F9',
    },
    text_header: {
        fontWeight: '700',
        fontSize: 18,
        color: color.black
    },
    text_header2: {
        fontWeight: '500',
        fontSize: 24,
        color: color.black
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    item_text: {
        marginLeft: 16,
    },
    cancel: {
        // backgroundColor: 'yellow',
        paddingHorizontal: 16,
        paddingVertical: 16,
        position: 'absolute',
    },
    item_setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 19
    }
});
