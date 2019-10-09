import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Switch, StyleSheet, Platform, Alert, ScrollView} from 'react-native'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import Icon2 from 'react-native-vector-icons/FontAwesome5'
import constants from '../../util/Constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import ItemSeparator from "../util/ItemSeparator";

const customStyles = StyleSheet.create({
        switch: {
            flex: 0,
        },
        switchContainer: {
            justifyContent: 'center'
        },
        textContainer: {
            flex: 2,
            paddingLeft:10,
            backgroundColor: constants.colors.transparent,
        },
        iconPadding: {
            paddingLeft: 10,
        }

    }
)

/**
 * display the settings
 */
export default class SettingsComponent extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: 'Einstellungen'
        }
    }


    constructor(props) {
        super(props)
        this.state = {
            ...constants.settings.defaults
        }
        this.getAllSettings()
    }

    async getAllSettings() {
        for(let key in constants.settings.keys) {
            settingsService.getSetting(key).then((value) => {
                    let newState = {}
                    newState[key] = value
                    if(this._mounted) {
                        this.setState(newState)
                    } else {
                        this.state[key] = value
                    }
                }
            )
        }
    }

    async setSetting(key, value) {
        settingsService.setSetting(key, value)
        let state = {}
        state[key] = value
        this.setState(state)
    }

    componentDidMount() {
        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
    }

    /**
     * opens the navigation drawer
     */
    async _toggleDrawer() {
        this.props.navigation.openDrawer()
    }

    render() {
        return (
            <ScrollView style={[
                styles.container,
                styles.containerLesson,
            ]}>

                <View style={styles.rowContainer}>
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
                        <Text style={styles.heading}>
                            {settingsService.visualizationFunction(constants.navigation.titles.settingsScreen)}
                        </Text>
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack]}/>

                <View
                    style={styles.iconButtonContainer}
                >
                    <TouchableOpacity
                        style={customStyles.textContainer}
                        accessible={true}
                        accessibilityLabel={`Video mit Ton abspielen`}
                        accessibilityHint={`Videos werden mit Ton abgespielt falls dieser verfügbar ist`}
                        onPress={() => this.setSetting(constants.settings.keys.muted,!this.state.muted)}
                        activeOpacity={0.7}
                        >
                        <Text style={styles.iconListItem}>
                            {settingsService.visualizationFunction('Video mit Ton')}
                        </Text>
                    </TouchableOpacity>
                    <View style={customStyles.switchContainer}>
                        <Switch
                            thumbColor={!this.state.muted ? constants.colors.lightblue : constants.colors.grey}
                            trackColor={
                                {
                                    true: constants.colors.shadedblue,
                                    false: Platform.OS === 'ios' ? constants.colors.grey : null,
                                }
                            }
                            onValueChange={(value) => this.setSetting(constants.settings.keys.muted,!value)}
                            value={!this.state.muted}
                        />
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>

                <View
                    style={styles.iconButtonContainer}
                >
                    <TouchableOpacity
                        onPress={() => this.setSetting(constants.settings.keys.showSeekbar, !this.state.showSeekbar)}
                        style={customStyles.textContainer}
                        accessible={true}
                        accessibilityLabel={`Video-Zeitleiste verbergen`}
                        accessibilityHint={`Es wird die Zeitleiste auf den Videos verborgen`}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.iconListItem}>
                            {settingsService.visualizationFunction('Video-Zeitleiste verbergen')}
                        </Text>
                    </TouchableOpacity>
                    <View style={customStyles.switchContainer}>
                        <Switch
                            thumbColor={!this.state.showSeekbar ? constants.colors.lightblue : constants.colors.grey}
                            trackColor={
                                {
                                    true: constants.colors.shadedblue,
                                    false: Platform.OS === 'ios' ? constants.colors.grey : null,
                                }
                            }
                            onValueChange={(value) => this.setSetting(constants.settings.keys.showSeekbar, !value)}
                            value={!this.state.showSeekbar}
                        />
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>

                <View
                    style={styles.iconButtonContainer}
                >
                    <TouchableOpacity
                        style={customStyles.textContainer}
                        accessible={true}
                        accessibilityLabel={`Video-Overlay verbergen`}
                        accessibilityHint={`Das Overlay auf dem Video Bildschirm wird verborgen`}
                        onPress={() => this.setSetting(constants.settings.keys.overlay, !this.state.overlay)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.iconListItem}>
                            {settingsService.visualizationFunction('Video-Overlay verbergen')}
                        </Text>
                    </TouchableOpacity>
                    <View style={customStyles.switchContainer}>
                        <Switch
                            thumbColor={!this.state.overlay ? constants.colors.lightblue : constants.colors.grey}
                            trackColor={
                                {
                                    true: constants.colors.shadedblue,
                                    false: Platform.OS === 'ios' ? constants.colors.grey : null,
                                }
                            }
                            onValueChange={(value) => this.setSetting(constants.settings.keys.overlay, !value)}
                            value={!this.state.overlay}
                        />
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>

                <View
                    style={styles.iconButtonContainer}
                >
                    <TouchableOpacity
                        style={customStyles.textContainer}
                        accessible={true}
                        accessibilityLabel={`Texte nur in Großbuchstaben`}
                        accessibilityHint={`Alle Texte werden nur in Großbuchstaben dargestellt`}
                        onPress={() => this.setSetting(constants.settings.keys.capitalized,!this.state.capitalized)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.iconListItem]}>
                            GROSSSCHREIBEN
                        </Text>
                    </TouchableOpacity>
                    <View style={customStyles.switchContainer}>
                        <Switch
                            thumbColor={this.state.capitalized ? constants.colors.lightblue : 'grey'}
                            trackColor={
                                {
                                    true: '#005462',
                                    false: Platform.OS === 'ios' ? constants.colors.grey : null,
                                }
                            }
                            onValueChange={(value) => this.setSetting(constants.settings.keys.capitalized, value)}
                            value={this.state.capitalized}
                        />
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>

                <View
                    style={[styles.iconButtonContainer]}
                >
                    <TouchableOpacity
                        style={customStyles.textContainer}
                        accessible={true}
                        accessibilityLabel={`Zu Über wechseln`}
                        accessibilityHint={`Es wird auf die Über Seite gewechselt`}
                        onPress={this._navigateToAbout.bind(this)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.iconListItem]}>
                            <Icon2
                                name='info-circle'
                                style={[styles.iconButton]}
                            />
                            {settingsService.visualizationFunction(' Über')}
                        </Text>
                    </TouchableOpacity>

                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>




            </ScrollView>
        );
    }

    async _navigateToAbout() {
        this.props.navigation.navigate(constants.navigation.keys.aboutScreen)
    }
}