// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { View, ViewStyle, TextStyle,Dimensions, Image,ImageBackground, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { HeaderProps } from './header.props';
// import {Button} from '../button/button';
// import {Text} from '../text/text';
import { color, spacing } from '../../theme';
// import {translate} from '../../i18n/';
import { DrawerActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { images } from '../../images';
import { useStores } from '../../models';
import { observer } from 'mobx-react-lite';
// import codePush from "react-native-code-push";
import { replaceHTTP } from '../../services';
import { UnitOfWorkService } from '../../services/api/unitOfWork-service';
import { StorageKey } from '../../services/storage/index';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// static styles
const ROOT: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    justifyContent: 'flex-start',
};
const TITLE: TextStyle = { textAlign: 'center' };
const TITLE_MIDDLE: ViewStyle = { flex: 1, justifyContent: 'center', alignItems: 'center' };
const LEFT: ViewStyle = { width: 32 };
const RIGHT: ViewStyle = { width: 32 };

const CENTER_IMG: any = {
    height: 24,
    resizeMode: 'contain',
};

const LEFT_IMG: any = {
    width: 40,
    resizeMode: 'contain',
};
const _unitOfWork = new UnitOfWorkService()
const layout = Dimensions.get('window');
const heightRate = layout.height / 844;
const widthRate = layout.width / 1280;
const fonsize = (layout.height * 20) / 844;
const RIGHT_IMG: any = {
    width: 20*heightRate,
    resizeMode: 'contain',
};

const RIGHT_IMG_AVATAR: any = {
    width: 28,
    height: 28,
    borderRadius: 28 / 2,
    backgroundColor: color.lightGrey
};


/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export const Header = observer(function Header(props: HeaderProps) {
    const isFocused = useIsFocused();
    const [userId, setUserId] = useState('')
    const [full_name, setFullName] = useState('')
    const [user_avatar, setUserAvatar] = useState('')
    const [email, setEmail] = useState('')
    const {
        // onLeftPress,
        // onRightPress,
        // rightIcon,
        // leftIcon,
        // headerText,
        // headerTx,
        style,
        onPressBtnNotify
        // titleStyle,
    } = props;
    // const header = headerText || (headerTx && translate(headerTx)) || '';
    const navigation = useNavigation();

    useEffect(() => {   
        fetchData()
    }, [isFocused])

    const fetchData = async () => {
        let userId = await _unitOfWork.storage.getItem(StorageKey.ID)
        let _full_name = await _unitOfWork.storage.getItem(StorageKey.FULL_NAME)
        let _user_avatar = await _unitOfWork.storage.getItem(StorageKey.USER_AVATAR)
       // Alert.alert(_user_avatar);
        setFullName(_full_name)
        setUserAvatar(_user_avatar)
        setUserId(userId)
    }
    
    // const {movesModel} = useStores();

    // const toggleMenu = () => {
    //     navigation.dispatch(DrawerActions.toggleDrawer());
    // };
    const toggleMenu = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
        
    };

    const goToPage = (page) => {
        navigation.navigate(page);
    };


    return (
        <View style={[ROOT, style, styles.wrapper]}>  
          <View style={styles.right_wrapper}>                
                <TouchableOpacity style={styles.btnIcon_2} onPress={toggleMenu}>
                    <Image source={images.icon_menu}  style={RIGHT_IMG} />
                </TouchableOpacity>
            </View>
         <View style={TITLE_MIDDLE}>
          <Text style={{fontWeight:'600', fontSize:fonsize+6, color:'white'}}   >QUẢN LÝ SẢN XUẤT</Text>          
        </View>        
        <TouchableOpacity onPress={() => {  
                    }}><View style={{flexDirection:'row'}}>
                        <View >
                        <Image  source={{ uri: `${user_avatar}` }}  style={{height:30*heightRate,width:30*heightRate, borderRadius:20*heightRate}} />
                        </View>
                         <Text style ={{fontSize:fonsize+3,fontWeight:'700',color:'white', marginLeft:10}}>{full_name}</Text>
                    </View>                         
                    </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#4B4B4D',
        borderBottomColor: '#182954',
        borderBottomWidth: 1
    },
    btnIcon: {
        // width: 100, height: 40,
        flexDirection: 'row'
    },
    right_wrapper: {
        flexDirection: 'row'
    },
    btnIcon_2: {
        width: 30*heightRate,
        height: 30*heightRate,
        backgroundColor: color.lighterGrey,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
});
