import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Dimensions} from 'react-native'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import ItemSeparator from "./ItemSeparator";
import Icon from "react-native-vector-icons/FontAwesome";


/**
 * visualizes a list item in a searchlist component using purecomponent to improve performance
 */
export default class ListItem extends PureComponent {
    constructor(props) {
        super(props)

    }

    render() {
        return (
            <View
                style={[styles.listItemContainer, {height:this.props.height}]}
                onLayout={(event) => {
                    let {height} = event.nativeEvent.layout;
                    this.props.setItemLayout && this.props.setItemLayout(height)
                }}
            >
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps='handled'
                >
                    <TouchableOpacity
                        style={{minWidth:Dimensions.get('window').width}}
                        accessible={true}
                        accessibilityLabel={`Gebärde ${this.props.item.item.readableName} anzeigen`}
                        accessibilityHint={`Es wird auf das Video der Gebärde ${this.props.item.item.readableName} gewechselt`}
                        onPress={(async () => this.props.onPress(this.props.item))}
                        activeOpacity={0.7}
                    >

                        <Text
                            style={styles.listItem}

                        >
                            {settingsService.visualizationFunction(this.props.item.item.readableName + (this.props.showLessonName ? ` (${this.props.item.item.lesson.readableName})` : '')) }
                        </Text>

                    </TouchableOpacity>
                </ScrollView>
                <ItemSeparator/>
            </View>
        )
    }
}