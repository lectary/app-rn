import React, {Component} from 'react';
import {Text, TouchableOpacity, ActivityIndicator, StyleSheet, View, TouchableHighlight} from 'react-native';
import lessonService from '../../services/LessonService'
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon2 from 'react-native-vector-icons/FontAwesome5'
import settingsService from '../../services/SettingsService'
import styles from '../../styles/styles';
import ItemSeparator from "../util/ItemSeparator";
import Dialog, {DialogFooter, DialogButton, DialogContent} from 'react-native-popup-dialog';
import DialogUtility from "../util/DialogUtility";
import constants from "../../util/Constants";
import Modal from "react-native-modal"

const customStyles = StyleSheet.create({
    dialogContainer: {
        flex: 0,
        backgroundColor: constants.colors.white,
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    dialogText: {
        color: constants.colors.black,
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    dialogHeaderText: {
        fontWeight: 'bold',
    }
})

/**
 * a special component used as the button to download and update lessons
 */
export default class DownloadButtonComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ...props,
        }
    }

    componentDidMount() {
        this._mounted = true
        this.setState(
            {
                exists: this.state.lesson.id !== undefined && this.state.lesson.id >= 0,
                updateable: this.state.lesson.date && (this.state.lesson.id !== undefined && this.state.lesson.id >= 0) && ((!this.state.lesson.oldDate) || (this.state.lesson.date > this.state.lesson.oldDate))
            }/*, () => console.log(`${this.state.lesson.readableName} : ${this.state.lesson.id}, ${this.state.updateable} , ${this.state.lesson.date}, ${this.state.lesson.id !== undefined}, ${this.state.lesson.oldDate}`)*/
        )

    }

    componentWillUnmount() {
        this._mounted = false
    }

    componentWillReceiveProps(props) {
        this.props = props
        if (props.lesson !== this.state.lesson) {
            this.setState(
                {
                    lesson: props.lesson,
                }, () => this.componentDidMount()
            )
        }
    }

    render() {
        return (
            <View
                style={[styles.container, styles.containerLesson, styles.containerLessonMargin]}
                onLayout={(event) => {
                    let {height} = event.nativeEvent.layout;
                    this.props.setItemLayout(height)
                }}
            >
                <TouchableHighlight
                    style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                    accessible={true}
                    accessibilityLabel={this.state.exists ?
                        `Zu Lektion ${this.state.lesson.readableName} wechseln` :
                        `Optionen zu Lektion ${this.state.lesson.readableName} öffnen`
                    }
                    accessibilityHint={
                        this.state.exists ?
                            `Gebärden der Lektion ${this.state.lesson.readableName} werden angezeigt` :
                            `Optionen zum Verwalten der Lektion ${this.state.lesson.readableName} werden geöffnet`
                    }
                    onPress={this._lessonClicked.bind(this)}
                    disabled={this.state.downloading}
                    underlayColor={constants.colors.lightblue}
                >
                    <View style={[styles.touchableHighlightIconWrapper]}>
                        <View style={
                            [styles.iconContainer,styles.iconMinWidth]
                        }>
                            {this.state.exists ?
                                (this.state.updateable ?
                                    <TouchableHighlight
                                        style={[styles.iconContainer, {flex:1}]}
                                        accessible={true}
                                        accessibilityLabel={`Optionen zu Lektion ${this.state.lesson.readableName} öffnen`}
                                        accessibilityHint={`Optionen zum Verwalten der Lektion ${this.state.lesson.readableName} werden geöffnet`}
                                        onPress={this._handleClick.bind(this)}
                                        underlayColor={constants.colors.lightblue}
                                    >
                                        <Icon2
                                            name='sync'
                                            style={styles.iconButton}
                                            width={44}
                                            
                                        />
                                    </TouchableHighlight> : <Icon
                                        name='check-circle'
                                        style={styles.iconButton}
                                        width={44}
                                    />)
                                : this.state.downloading ?
                                    <ActivityIndicator
                                        color={constants.colors.lightblue}
                                        style={{padding: 12}}/> : null}
                        </View>
                        <Text
                            style={[styles.iconListItem, styles.iconListItemLessons,]}
                            numberOfLines={1}
                        >
                            {settingsService.visualizationFunction(this.state.lesson.readableName)}
                        </Text>
                        <TouchableOpacity
                            style={styles.headerIconWrapper}
                            accessible={true}
                            accessibilityLabel={`Optionen zu Lektion ${this.state.lesson.readableName} öffnen`}
                            accessibilityHint={`Optionen zum Verwalten der Lektion ${this.state.lesson.readableName} werden geöffnet`}
                            disabled={this.state.downloading}
                            onPress={() => this._handleClick()}
                        >
                            <Icon2
                                name='ellipsis-h'
                                style={styles.iconButton}
                                width={44}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableHighlight>
                <ItemSeparator
                    style={styles.listItemSeparatorBlack}
                />

                <DialogUtility
                    ref={(ref) => this.dialogUtility = ref}
                />
            </View>
        )
    }

    async _lessonClicked() {
        if (this.state.exists) {
            this.props.navigateTo && this.props.navigateTo(this.state.lesson)
        } else {
            this._handleClick()
        }
    }

    async _handleClick() {
        this.props.showModal && this.props.showModal(
            {
                lesson: this.state.lesson,
                download: this.downloadLesson.bind(this),
                update: this.redownloadLesson.bind(this),
                delete: this.deleteLesson.bind(this),
                exists: this.state.exists,
                updateable: this.state.updateable,
            }
        )
    }

    async downloadLesson() {
        //console.log('downloading lesson: ' + this.state.lesson.name)
        this.setState(
            {
                downloading: true,
            }
        )
        try {
            await lessonService.downloadLesson(this.state.lesson, this.receiveDownloadSuccess.bind(this))
        } catch (e) {
            //console.log(e)
            this.setState({
                downloading: false,
            })
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Bitte versuchen Sie es erneut!'],
                    informationDialogTitle: 'Fehler beim Herunterladen der Lektion!',
                }
            )
        }
    }

    async redownloadLesson() {
        this.setState(
            {
                exists: false,
                updateable: false,
                downloading: true,
            }
        )
        try {
            await lessonService.deleteLesson(this.state.lesson, (success) => {
                if (success) {
                    //console.log(`deleted lesson ${this.state.lesson.readableName}`)
                    this.downloadLesson(this.state.lesson)
                } else {
                    this.setState({
                        downloading: false,
                    })
                    this.dialogUtility && this.dialogUtility.showInformationDialog(
                        {
                            informationDialogText: ['Bitte versuchen Sie es erneut!'],
                            informationDialogTitle: 'Fehler beim Aktualisieren der Lektion!',
                        }
                    )
                }
            })
        } catch (e) {
            //console.log(e)
            this.setState({
                downloading: false,
            })
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Bitte versuchen Sie es erneut!'],
                    informationDialogTitle: 'Fehler beim Aktualisieren der Lektion!',
                }
            )

        }
    }

    async receiveDownloadSuccess(success, errorMessage = 'Bitte versuchen Sie es erneut!') {
        if (success) {
            if (this._mounted) {
                this.setState({
                    lesson: success,
                    downloading: false,
                    updateable: false,
                    exists: success,
                })
            }
        } else if (this._mounted) {
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: [errorMessage],
                    informationDialogTitle: 'Fehler beim Herunterladen der Lektion!',
                }
            )
            this.setState(
                {
                    downloading: false,
                }
            )
        }
    }

    async deleteLesson() {
        this.setState(
            {
                downloading: true,
                modalVisible: false,
            }
        )
        try {
            await lessonService.deleteLesson(this.state.lesson, this.receiveDeleteSuccess.bind(this))
        } catch (error) {
            //console.log('error deleting lesson')
            //console.log(error)
            this.setState(
                {
                    downloading: false,
                }
            )
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Versuchen Sie es erneut!'],
                    informationDialogTitle: 'Fehler beim Löschen der Lektion!',
                }
            )
        }
    }

    async receiveDeleteSuccess(success) {
        if (this._mounted) {
            this.setState({
                    downloading: false,
                    exists: false,
                }
            )
            if(this.state.lesson.notOnServer) {
                this.props.update && this.props.update()
            }
        }
        if ((!success) && this._mounted) {
            this.setState(
                {
                    downloading: false,
                }
            )
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Versuchen Sie es erneut!'],
                    informationDialogTitle: 'Fehler beim Löschen der Lektion!',
                }
            )
        }
    }
}