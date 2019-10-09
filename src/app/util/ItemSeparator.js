import React, {PureComponent} from 'react';
import {View} from 'react-native'
import styles from '../../styles/styles'

/**
 * simple separator for lists
 */
export default class ItemSeparator extends PureComponent {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <View
                style={[styles.listItemSeparator, this.props.style]}/>
        )
    }
}