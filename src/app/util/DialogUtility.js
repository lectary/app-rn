import React, {PureComponent} from 'react';
import {View, Text} from 'react-native'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import Dialog, { DialogFooter, DialogButton, DialogContent } from 'react-native-popup-dialog';

/**
 * Utility class to display dialogs, either for confirmation or for information
 */
export default class DialogUtility extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            showConfirmationDialog: false,
            showInformationDialog: false,

            confirmationDialogSubmissionButtonText: 'Ok',
            confirmationDialogSubmissionButtonStyle: {},
            confirmationDialogCancelButtonText: 'Abbrechen',
            confirmationDialogText: ['Möchten Sie das wirklich machen?'],
            informationDialogText: ['Unbekannter Fehler'],
        }
    }

    render() {
        return (
            <View
            >
                <Dialog
                    width={0.8}
                    visible={this.state.showConfirmationDialog}
                    onTouchOutside={() => this.setState({showConfirmationDialog: false})}
                    footer={
                        <DialogFooter>
                            <DialogButton
                                textStyle={styles.dialogButtonText}
                                text={settingsService.visualizationFunction(this.state.confirmationDialogCancelButtonText)}
                                onPress={() => this.setState({showConfirmationDialog: false})}
                            />
                            <DialogButton
                                textStyle={[styles.dialogButtonText, this.state.confirmationDialogSubmissionButtonStyle]}
                                text={settingsService.visualizationFunction(this.state.confirmationDialogSubmissionButtonText)}
                                onPress={() => {
                                    this.state.onConfirmationPress && this.state.onConfirmationPress()
                                    this.setState({showConfirmationDialog: false})
                                }
                                }
                            />
                        </DialogFooter>
                    }
                >
                    <DialogContent>
                        {this.state.confirmationDialogTitle ? <Text style={styles.dialogContentTitle}>{settingsService.visualizationFunction(this.state.confirmationDialogTitle)}</Text> : null}
                        {this.state.confirmationDialogText.map(text => <Text style={styles.dialogContentText}>{settingsService.visualizationFunction(text)}</Text>)}
                    </DialogContent>
                </Dialog>

                <Dialog
                    width={0.8}
                    visible={this.state.showInformationDialog}
                    onTouchOutside={() => this.setState({showInformationDialog: false})}
                    footer={
                        <DialogFooter>
                            {[<DialogButton
                                key={'cancel_button_error'}
                                textStyle={styles.dialogButtonText}
                                text={settingsService.visualizationFunction('Ok')}
                                onPress={() => this.setState({showInformationDialog: false})}
                            />]}
                        </DialogFooter>
                    }
                >
                    <DialogContent>
                        {this.state.informationDialogTitle ? <Text style={styles.dialogContentTitle}>{settingsService.visualizationFunction(this.state.informationDialogTitle)}</Text> : null}
                        {this.state.informationDialogText.map(text => <Text style={styles.dialogContentText}>{settingsService.visualizationFunction(text)}</Text>)}
                    </DialogContent>
                </Dialog>

            </View>
        )
    }

    async showInformationDialog(information) {
        this.setState(
            {
                informationDialogTitle: information.informationDialogTitle,
                informationDialogText: information.informationDialogText,
                showInformationDialog: true,
                showConfirmationDialog: false,
            }
        )
    }

    async showConfirmationDialog(information) {
        this.setState(
            {
                showInformationDialog: false,
                showConfirmationDialog: true,
                confirmationDialogText: information.confirmationDialogText,
                confirmationDialogTitle: information.confirmationDialogTitle,
                confirmationDialogSubmissionButtonStyle: information.confirmationDialogSubmissionButtonStyle,
                onConfirmationPress: information.onConfirmationPress,
                confirmationDialogSubmissionButtonText: information.confirmationDialogSubmissionButtonText ? information.confirmationDialogSubmissionButtonText : this.state.confirmationDialogSubmissionButtonText,
                confirmationDialogCancelButtonText: information.confirmationDialogCancelButtonText ? information.confirmationDialogCancelButtonText : this.state.confirmationDialogCancelButtonText
            }
        )
    }
}