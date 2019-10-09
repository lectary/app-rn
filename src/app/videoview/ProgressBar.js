import React, {PureComponent} from 'react';
import {StyleSheet} from 'react-native'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import {Bar} from 'react-native-progress'
import constants from "../../util/Constants";

const customStyles = StyleSheet.create(
    {
        progressBar: {
            color: constants.colors.yellow,
            width: '100%',
            alignSelf: 'flex-end',
            position: 'absolute',
            bottom: 0,
            height: 4,
        },
    }
)

/**
 * wrapper for the progress bar to improve performance, as state updates on this component only affect this single component
 */
export default class ProgressBar extends PureComponent {
    constructor(props) {
        super(props)

        this.state={
            progress:0,
        }
    }

    /**
     * update the progress to the given value
     * @param value a value between 0 and 1 to set the progress to
     */
    async updateProgress(value) {
        this.setState(
            {
                progress: value
            }
        )
    }

    render() {
        return (
                <Bar
                    style={customStyles.progressBar}
                    animated={false}
                    progress={this.state.progress}
                    width={null}
                    borderWidth={0}
                    borderRadius={0}
                    color={constants.colors.yellow}
                    heigth={2}
                />
        )
    }
}