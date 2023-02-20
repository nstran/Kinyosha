import React from 'react';
import {
  TouchableOpacity,
  View,StyleSheet
} from 'react-native';
// import {setLogout} from '../../services/authActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {color} from '../../theme';
import { useStores } from '../../models';
import { styled, StyleService, Text } from '@ui-kitten/components';
import {useNavigation} from "@react-navigation/native"
import CenterSpinner from '../../components/center-spinner/center-spinner';
import { UnitOfWorkService } from '../../services/api/unitOfWork-service';
import { setLogout, setRegister, setReload_Logout } from '../../services';

// @ts-ignore
const AuthLoadingScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const workSifyModel = useStores();  
  const _bootstrapAsync = async () => {
    setLogout(() => navigation.navigate('LoginScreen',{
      isChat: false
    }));
    setRegister(() => navigation.navigate('RegisterScreen'));
    setReload_Logout(() => navigation.navigate('Loading'))
    let firstApp = await workSifyModel.workSifyModel.getUserInfoByKey('firstApp') 
    // let firstApp = true
    if (firstApp) {
        navigation.navigate('WellcomeScreen');
    }
    else navigation.navigate('primaryStack');
    }

  React.useEffect(() => {
    isFocused && _bootstrapAsync();
  }, [isFocused, workSifyModel]);

  return (
    <View style={{flex: 1, backgroundColor: color.primary}}>
      {/* <CenterSpinner /> */}
    </View>
  );
};

export default AuthLoadingScreen;
