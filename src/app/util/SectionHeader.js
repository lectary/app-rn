import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet} from 'react-native'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import ItemSeparator from "./ItemSeparator";
import constants from "../../util/Constants"

const customStyles = StyleSheet.create({
    sectionHeaderContainer: {
        backgroundColor: constants.colors.white,
    },
    sectionHeader: {
        color: constants.colors.lightblue,
        backgroundColor: constants.colors.white,
        fontSize: 15,
        padding: 5,
        paddingVertical: 5,
    }

})

/**
 * visualizes a section header in a list
 */
export default class SectionHeader extends PureComponent {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <View
                style={[customStyles.sectionHeaderContainer,
                        {height: this.props.height}
                    ]}
                onLayout={(event) => {
                    let {height} = event.nativeEvent.layout;
                    this.props.setItemLayout && this.props.setItemLayout(height)
                }}
            >
                <Text
                    style={[styles.listItem, customStyles.sectionHeader]}

                >
                    {settingsService.visualizationFunction(this.props.item)}
                </Text>
                {
                    this.props.itemSeparator ?
                        this.props.itemSeparator :
                        <ItemSeparator style={[styles.listItemSeparatorBlack]} />
                }
            </View>
        )
    }
}