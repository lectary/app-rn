/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, StatusBar, YellowBox, Dimensions} from 'react-native'
import DownloadComponent from './download/DownloadComponent';
import {createStackNavigator, createAppContainer, SafeAreaView, createDrawerNavigator} from "react-navigation";
import AboutComponent from './about/AboutComponent'
import styles from '../styles/styles';
import VideoSwiper from './videoview/VideoSwiper';
import VocabularyListComponent from './videoview/VocabularyListComponent'
import NavigationDrawer from './navigation/NavigationDrawer'
import SettingsComponent from './setttings/SettingsComponent'
import constants from "../util/Constants";
import SplashScreen from 'react-native-splash-screen';

const customStyles = StyleSheet.create(
    {
        safeAreViewContainer: {
            flex: 1,
            backgroundColor: constants.colors.white,
        }
    }
)

export default class App extends Component {

    componentWillMount(): void {
        setTimeout(() => {
            SplashScreen.hide()
        }, 200)
    }

    render() {
        //ignore those warnings that are not relevant for this project
        //ad 'bind()': we need to use the react-native-gesture-handler ScrollView in the VideoSwiper to make it scrollable, the showed warning has no effect
        //ad 'Failed prop type: Invalid props.containerStyle key': The searchbox component for some reason does not want to accept the fontSize style, but it is a deafult styling so we ignore the warning
        //ad 'Each child in an array or iterator should have a unique': This warning is really annoying when wanting to use an array of strings
        YellowBox.ignoreWarnings(['bind()',  "Failed prop type: Invalid props.inputContainerStyle key", "Failed prop type: Invalid props.containerStyle key", 'Each child in an array or iterator should have a unique'])

        //on ios, the keyboard does not push everything up by default, so we have to use the keybaordavoiding view, but on android not
        //the SafeAreaView keeps the screen from taking up the space next to the notch and control elements on new iPhones
        return (
            <SafeAreaView style={customStyles.safeAreViewContainer}>
                <StatusBar
                    barStyle={'dark-content'}
                    hidden={false}
                    backgroundColor={constants.colors.white}
                    color={'black'}/>
                <KeyboardAvoidingView
                    enabled={Platform.OS === 'ios'}
                    style={styles.container}
                    behavior='padding'>
                    <AppContainer/>
                </KeyboardAvoidingView>
            </SafeAreaView>
        )


    }
}

/**
 * a stack navigator for switching between the list of words and the actual video carousel
*/
const VocabularyViewStack = createStackNavigator({
    VideoView: VideoSwiper,
    ListView: VocabularyListComponent
}, {
    headerMode: 'none',
    mode: 'modal',
})

/** a stack navigator for switching between settings and the settings
*/
const SettingsAboutView = createStackNavigator({
    SettingsView: SettingsComponent,
    AboutView: AboutComponent
}, {
    headerMode: 'none',
})

/**
 * the main drawer navigation
 */
const DrawerNavigator = createDrawerNavigator({
    VocabularyView: {
        screen: VocabularyViewStack,
        navigationOptions: ({navigation}) => {
            return {title: 'Vokabeln lernen'}
        }
    },
    DownloadView: DownloadComponent,
    SettingsAboutView: SettingsAboutView,
    AboutView: AboutComponent

}, {
    //drawerWidth: Dimensions.get('window').width*0.8,
    initialRouteName: 'VocabularyView',
    backBehavior: 'initialRoute',
    contentComponent: (props) => <NavigationDrawer {...props}/>

})

const AppContainer = createAppContainer(DrawerNavigator);
