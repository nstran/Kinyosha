// import { AsyncStorage } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const StorageKey = {
    TOKEN: 'TOKEN',
    USER_INFO: 'USER_INFO',
    USERNAME: 'USERNAME',
    USERID:"USERID",
    ID: 'ID',
    TENANTHOST:"TENANTHOST",
    PASSWORD: 'USER_PASSWORDINFO',
    REMEMBER_PASS: 'REMEMBER_PASS',
    ID_FIREBASE: 'ID_FIREBASE',
    DEVICE_TOKEN: 'DEVICE_TOKEN',
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
    USER_AVATAR:'USERAVATAR',
    TYPE: 'TYPE',
    PRODUCTION_PROCESS_ID: 'PRODUCTION_PROCESS_ID',

}
export class Storage {
    async clearStore() {
        // await Promise.all(Object.keys(StoreKey).map(key => {
        //     removeItem(key);
        // }))
        AsyncStorage.clear();
    }

    async getToken() {
        var access_token = await String(AsyncStorage.getItem(StorageKey.TOKEN));
        return 'Bearer ' + access_token;
    }

    async getItem(key: string) {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) {
                // We have data!!
                return JSON.parse(value);
            }
        } catch (error) {
            return null;
            // Error retrieving data
        }
    }
    async removeItem(key: string) {
        await AsyncStorage.removeItem(key)
    }
    async logout() {
        await AsyncStorage.removeItem(StorageKey.TOKEN);
        await AsyncStorage.removeItem(StorageKey.USERNAME);
        await AsyncStorage.removeItem(StorageKey.PASSWORD);
        await AsyncStorage.removeItem(StorageKey.USER_INFO);
        await AsyncStorage.removeItem(StorageKey.REMEMBER_PASS)
        await AsyncStorage.removeItem(StorageKey.ID_FIREBASE)
        await AsyncStorage.removeItem(StorageKey.FULL_NAME)
        await AsyncStorage.removeItem(StorageKey.EMAIL)
        await AsyncStorage.removeItem(StorageKey.ID)

    }
    async setItem(key: string, val: any) {
 
        
        try {
            await AsyncStorage.removeItem(key)
            await AsyncStorage.setItem(key, JSON.stringify(val))
        } catch (error) {

        }

    }
    async setItemNumber({ key, val }: { key: string; val: any; }) {
        try {
            await AsyncStorage.removeItem(key)
            await AsyncStorage.setItem(key, JSON.stringify(val))
        } catch (error) {

        }
    }
}
