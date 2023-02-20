import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Animated, Dimensions, FlatList, StyleSheet, View, ViewStyle, Text, TouchableOpacity, Image } from 'react-native';
import { Screen } from '../../components';
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from '../../theme';
import CenterSpinner from '../../components/center-spinner/center-spinner';
import LinearGradient from 'react-native-linear-gradient';
import { images } from '../../images';


const layout = Dimensions.get('window');
const ROOT: ViewStyle = {
    backgroundColor: color.primary,
    flex: 1,
};

export const WellcomeScreen2 = observer(function WellcomeScreen() {
    const navigation = useNavigation();
    // const {movesModel} = useStores();
    const [isLoading, setLoading] = useState(false);

    // useEffect(() => {
    //   fetchData();
    // }, []);
    // const fetchData = async () => {
    // };

    const goToPage = (page) => {
        navigation.navigate(page);
    };
    return (
        <>
            {isLoading && <CenterSpinner />}
            <Screen style={ROOT} preset="fixed">
                <LinearGradient
                    colors={['#182954','#306C88']}
                    style={styles.container}
                >
                    <Image
                        style={styles.containerImage}
                        source={images.welcome}
                    />
                    <View style={styles.containerText}>
                        <Text style={styles.textWelcome}>Welcome to Worksify!</Text>
                        <Text style={styles.textContent}>A way to find job and chat with Recruiter instantly</Text>
                    </View>
                    <View style={styles.containerBox}>
                        <TouchableOpacity
                            onPress={() => goToPage('registerScreen')}
                            style={styles.containerButton}
                        >
                            <Text style={styles.textBtn}>Register</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => goToPage('LoginScreen')}
                            style={styles.containerButton}>
                            <Text style={styles.textBtn}>Login</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CategoryScreen')}
                        style={styles.containerNext}>
                        <Text style={styles.textBtnNext}>Next</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Screen>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    containerImage: {
        marginTop: '5%',
        height: '50%',
        width: '90%',
        borderWidth: 1,
        marginLeft: '5%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerText: {
        marginTop: '5%',
        height: '15%',
        width: '90%',
        marginLeft: '5%',
        justifyContent: 'space-between',
    },
    textWelcome: {
        color: 'white',
        fontSize: 22,
        fontWeight: '600',
    },
    textContent: {
        color: 'white',
        fontSize: 17,
        fontWeight: '400',
    },
    containerBox: {
        height: '8%',
        width: '90%',
        flexDirection: 'row',
        marginLeft: '5%',
        marginTop: '5%',
        justifyContent: 'space-between'
    },
    containerButton: {
        borderWidth: 1,
        borderColor: '#41B1DF',
        borderRadius: 30,
        height: '100%',
        width: '45%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBtn: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },
    containerNext: {
        height: 48,
        width: '90%',
        marginLeft: '5%',
        marginTop: '5%',
        borderRadius: 30,
        backgroundColor: '#41B1DF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBtnNext: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600'
    },


});
