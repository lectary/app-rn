import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Linking, Dimensions} from 'react-native';
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import constants from '../../util/Constants';
import Icon from 'react-native-vector-icons/FontAwesome'
import {ScrollView} from 'react-native-gesture-handler';
import ItemSeparator from "../util/ItemSeparator";
import {Image} from "react-native-elements";

const customStyles = StyleSheet.create({
    aboutTextContainer: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
    aboutText: {
        paddingTop: 15,
        color: constants.colors.black,
        textAlign: 'left',
        fontSize: 18,
    },
    versionText: {
        textAlign: 'right',
        fontSize: 10,
    },
    aboutLink: {
        color: constants.colors.red,
        textDecorationLine: 'underline',
        textDecorationStyle: "solid",
    },
    aboutTextHeading: {
        fontSize: 50,
        color: constants.colors.white,
        fontWeight: 'bold',
    },
    aboutPadding: {
        paddingHorizontal: 10,
    },
    lectaryLogoContainer: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: constants.colors.darkblue
    },
    lectaryLogoImageContainer: {
        flex: 0,
        width: Dimensions.get('window').width * 0.2,
        height: Dimensions.get('window').height * 0.2,
    },
    lectaryLogoImage:  {
        flex: 0,
        width: '100%',
        height: '100%',
    },
    lectaryLogoText: {
        position: 'absolute',
        bottom: Dimensions.get('window').width * 0.2 * 0.1,
    },
    okButtonContainer: {
        marginTop: 10,
        padding: 10,
        width: '100%',
        flex: 1,
        backgroundColor: constants.colors.lightblue,
        justifyContent: 'center',
        textAlign: 'center',
    },
    okButtonText: {
        color: constants.colors.white,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 40,
    }

})

/**
 * a component to display the about of the app
 */
export default class AboutComponent extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: constants.navigation.titles.aboutScreen
        }
    }


    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    render() {
        return (
            <View style={[styles.container, styles.containerLesson]}>
                <View
                    style={styles.iconButtonContainer}
                    activeOpacity={0.7}
                >
                    <TouchableOpacity
                        style={styles.headerIconWrapper}
                        accessible={true}
                        accessibilityLabel={`Navigation öffnen`}
                        accessibilityHint={`Die Navigation wird geöffnet`}
                        onPress={this._toggleDrawer.bind(this)}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name='bars'
                            style={styles.headerBurgerIcon}
                        />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text
                            style={styles.heading}
                            ellipsizeMode={'tail'}
                            numberOfLines={1}>
                            {
                                settingsService.visualizationFunction(constants.navigation.titles.aboutScreen)
                            }
                        </Text>
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack]}/>
                <ScrollView style={
                    [styles.container,
                        styles.containerLesson,
                        customStyles.aboutTextContainer]
                }>
                    <View style={[customStyles.lectaryLogoContainer]}>
                        <View
                            style={[customStyles.lectaryLogoImageContainer]}
                        >
                            <Image
                                source={require('../../resources/Logo1_0-1024x1024.png')}
                                style={[customStyles.lectaryLogoImage]}

                            />
                        </View>
                        {/*<View style={styles.container}>
                        <Text style={
                            [customStyles.aboutText,
                                customStyles.aboutTextHeading,
                                customStyles.lectaryLogoText
                            ]
                        }>
                            {settingsService.visualizationFunction('ectary')}
                        </Text>
                    </View>*/}
                    </View>

                    <View style={[customStyles.aboutPadding]}>
                        <Text style={customStyles.aboutText}>
                            {settingsService.visualizationFunction('Lectary, überall und jederzeit Gebärden lernen. ' +
                                'Weitere Informationen zu diesem Projekt ' +
                                'finden Sie auf ')}
                            <Text
                                style={[customStyles.aboutText, customStyles.aboutLink]}
                                textDecorationLine={'underline'}
                                onPress={
                                    () => Linking.openURL(`${constants.lectaryWebPage}`)
                                }>
                                {settingsService.visualizationFunction(`lectary.net`)}
                            </Text>
                            {
                                settingsService.visualizationFunction(
                                    '. Wenn Sie Ihre Lernvideos über Lectary ' +
                                    'anbieten wollen, setzen Sie sich mit uns in Verbindung.'
                                )
                            }

                        </Text>

                        <Text style={customStyles.aboutText}>
                            {settingsService.visualizationFunction('Fragen, Hinweise, Anregungen bitte an ')}
                            <Text
                                style={[customStyles.aboutText, customStyles.aboutLink]}
                                textDecorationLine={'underline'}
                                onPress={
                                    () => Linking.openURL(`mailto:${constants.lectaryEmail}`)
                                }>
                                {settingsService.visualizationFunction(`info@lectary.net`)}
                            </Text>
                        </Text>


                        <Text style={customStyles.aboutText}>
                            {settingsService.visualizationFunction('Anleitung:  ')}
                            <Text
                                style={[customStyles.aboutText, customStyles.aboutLink]}
                                textDecorationLine={'underline'}
                                onPress={
                                    () => Linking.openURL(`${constants.lectaryWebPage}/anleitung.html`)
                                }>
                                {settingsService.visualizationFunction(`lectary.net/anleitung.html`)}
                            </Text>
                        </Text>


                        <Text style={customStyles.aboutText}>
                            {settingsService.visualizationFunction('Credits:')}
                        </Text>

                        <Text
                            style={[customStyles.aboutText, customStyles.aboutLink]}
                            textDecorationLine={'underline'}
                            onPress={
                                () => Linking.openURL(`https://facebook.github.io/react-native/`)
                            }>
                            {settingsService.visualizationFunction(`React Native`)}
                        </Text>

                        <Text
                            style={[customStyles.aboutText, customStyles.aboutLink]}
                            textDecorationLine={'underline'}
                            onPress={
                                () => Linking.openURL(`https://fontawesome.com/`)
                            }>
                            {settingsService.visualizationFunction(`Font Awesome`)}
                        </Text>
                        <Text style={customStyles.aboutText}>
                            {settingsService.visualizationFunction('Icon made by ')}
                            <Text
                                style={[customStyles.aboutText, customStyles.aboutLink]}
                                textDecorationLine={'underline'}
                                onPress={
                                    () => Linking.openURL(`http://www.freepik.com/`)
                                }>
                                {settingsService.visualizationFunction(`FreePik`)}
                            </Text>
                            {settingsService.visualizationFunction(' from ')}
                            <Text
                                style={[customStyles.aboutText, customStyles.aboutLink]}
                                textDecorationLine={'underline'}
                                onPress={
                                    () => Linking.openURL(`https://www.flaticon.com`)
                                }>
                                {settingsService.visualizationFunction(`www.flaticon.com`)}
                            </Text>
                        </Text>



                        <Text style={[customStyles.aboutText, customStyles.versionText]}>
                            {settingsService.visualizationFunction('Version: 3.1#2019-05-18--12:00:00')}
                        </Text>

                    </View>
                    <TouchableOpacity
                        style={[customStyles.okButtonContainer]}
                        onPress={async () => this.props.navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[customStyles.okButtonText]}
                        >
                            OK
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    /**
     * opens the navigation drawer
     */
    async _toggleDrawer() {
        this.props.navigation.openDrawer()
    }
}