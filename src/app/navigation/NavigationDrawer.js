import React, { Component } from 'react';
import { ActivityIndicator, SectionList, View, Text, FlatList, TouchableHighlight, TouchableOpacity, StyleSheet, BackHandler, Dimensions } from 'react-native'
import styles from '../../styles/styles'
import { replacePatterns, replaceForSort } from '../../util/ReplacementService'
import constants from '../../util/Constants';
import settingsService from '../../services/SettingsService'
import Icon from 'react-native-vector-icons/FontAwesome'

import ItemSeparator from "../util/ItemSeparator";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import lessonService, {getAllLessonsOption} from '../../services/LessonService'
import SectionHeader from "../util/SectionHeader";
import DialogUtility from "../util/DialogUtility";


const customStyles = StyleSheet.create({
    drawerList: {
        backgroundColor: constants.colors.darkblue,
        flex: 1,
    },
    drawerItem: {
        // height: Dimensions.get('window').height/8,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    drawerText: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignSelf: 'center',
        fontSize: 20,
        borderRadius: 10,
        //marginHorizontal:10,
    },
    drawerSelectedItem: {
        backgroundColor: constants.colors.lightblue,
    },
    drawerSelectedIcon: {
        color: constants.colors.white,
    },
    drawerSelectedText: {
        //backgroundColor: constants.colors.lightblue,
        color: constants.colors.white,
    },
    drawerSpecialItemsContainer: {
        backgroundColor: constants.colors.white,
        flex: 0,
    },
    drawerSpecialListItemContainer: {
        backgroundColor: constants.colors.white,
    },
    drawerSpecialListItem: {
        backgroundColor: constants.colors.white,
        color: constants.colors.lightblue,
    },
    noVideosAvailableText: {
        paddingLeft:10,
    },

    iconPadding: {
        paddingLeft: 10,
    }
})

/**
 * this class had to be implemented to make it possible to rerender the components on switching using the Drawer Navigation
 */
export default class NavigationDrawer extends Component {


    constructor(props) {
        super(props)
        this.state={
            filteredLessons: [],
            nothingFound: false,
            currentFilter: '',
            showDeleteAllDialog: false,
            selectedLessonId: -1,
        }
    }

    onBackPress() {
        if (!(this.props.activeItemKey === 'VideoView'
            || this.props.activeItemKey === 'VocabularyView'
            || this.props.activeItemKey === 'ListView'
            || this.props.activeItemKey === constants.navigation.keys.settingsAboutView)) {
            this.navigateToVideo()
        } else {
            return false
        }
        return true
    }

    async navigateToVideo() {
        if (!(this.props.activeItemKey === constants.navigation.keys.videoScreen
            || this.props.activeItemKey === constants.navigation.keys.vocabularyViewStack
            || this.props.activeItemKey === constants.navigation.keys.wordListScreen)) {

            this.props.navigation.navigate('VideoView', {
                words: [],
                index: undefined,
            }
            )
        } else {
            this.props.navigation.closeDrawer();
        }
    }

    componentDidMount() {
        this._mounted = true
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBackPress.bind(this));
        this._getAllLessons();
    }

    componentWillUnmount() {
        this._mounted = false
        if (this.backHandler) {
            this.backHandler.remove()
        }
    }

    componentWillReceiveProps(props) {
        this.props = props
        let lessonId = this.props.navigation.state.selectedLessonId
        if(lessonId && lessonId !== this.state.selectedLessonId) {
            this.setState(
                {
                    selectedLessonId: lessonId,
                }
            )
        }
        this._getAllLessons()
    }

    render() {
        return (
            <View style={[styles.container, styles.containerLesson]}>
                <TouchableOpacity
                    style={styles.rowContainer}
                    activeOpacity={0.7}
                    onPress={this.toggleDrawer.bind(this)}
                >
                    <View
                        style={[styles.headerIconWrapper]}


                    >
                        <Icon
                            name='chevron-left'
                            style={styles.headerBurgerIcon}
                        />
                    </View>
                    <View style={styles.header}>
                        <Text style={styles.heading}>
                            {settingsService.visualizationFunction(constants.appName)}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={[customStyles.drawerList, styles.containerLesson]}>
                    <ItemSeparator style={styles.listItemSeparatorBlack} />
                    <SectionList
                        ref={(ref) => this.searchList = ref}
                        style={styles.containerLesson}
                        sections={this.state.filteredLessons}
                        renderItem={this._renderWordList.bind(this)}
                        renderSectionHeader={this._renderSectionHeader.bind(this)}
                        initialNumToRender={40}
                        keyExtractor={(item, index) => (item.id + ' ' + index)}
                        keyboardShouldPersistTaps='handled'
                        ListEmptyComponent={this._getListEmptyComponent.bind(this)}
                        getItemLayout={sectionListGetItemLayout({
                            getItemHeight: (rowData, sectionIndex, rowIndex) => this.state.listItemHeight || 44,
                            getSectionHeaderHeight: (sectionIndex) => {
                                if (sectionIndex === 0 && this.state.filteredLessons[0].title === constants.allOption) {
                                    return 0
                                }
                                return this.state.sectionHeaderHeight || 30.9
                            }
                        })
                        }

                    />

                    <ItemSeparator style={styles.listItemSeparatorBlack} />

                    <TouchableOpacity
                        style={[styles.iconButtonContainer, styles.containerLesson, customStyles.drawerItem,  (this.props.activeItemKey === constants.navigation.keys.downloadScreen) && customStyles.drawerSelectedItem]}
                        accessible={true}
                        accessibilityLabel={`Gehe zu Lektionen verwalten`}
                        accessibilityHint={`Es wird auf die Lektionen verwalten Seite gewechselt`}
                        onPress={(() => this.onPress(constants.navigation.keys.downloadScreen))}
                        activeOpacity={0.7}
                    >

                        <Text
                            style={[styles.iconListItem, styles.iconListItemLessons, customStyles.drawerText, customStyles.iconPadding, (this.props.activeItemKey === constants.navigation.keys.downloadScreen) && customStyles.drawerSelectedText]}>
                            <Icon
                                name='cloud-download'
                                style={[styles.iconButton, customStyles.iconButton, (this.props.activeItemKey === constants.navigation.keys.downloadScreen) && customStyles.drawerSelectedIcon]}
                                onPress={this.toggleDrawer.bind(this)}
                            />
                            {'  ' + settingsService.visualizationFunction(replacePatterns(constants.navigation.titles.downloadScreen))}
                        </Text>

                    </TouchableOpacity>

                    <ItemSeparator style={styles.listItemSeparatorBlack} />

                    <TouchableOpacity
                        style={[styles.iconButtonContainer, styles.containerLesson, customStyles.drawerItem, (this.props.activeItemKey === constants.navigation.keys.settingsAboutView) && customStyles.drawerSelectedItem,]}
                        accessible={true}
                        accessibilityLabel={`Zu Einstellungen wechseln`}
                        accessibilityHint={`Es wird auf die Einstellungen Seite gewechselt`}
                        onPress={() => this.onPress(constants.navigation.keys.settingsScreen)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.iconListItem,
                            styles.iconListItemLessons,
                            customStyles.drawerText,
                            customStyles.iconPadding,
                            (this.props.activeItemKey === constants.navigation.keys.settingsAboutView) && customStyles.drawerSelectedText,
                        ]}>
                            <Icon
                                name='cog'
                                style={[styles.iconButton, customStyles.iconButton, (this.props.activeItemKey === constants.navigation.keys.settingsAboutView) && customStyles.drawerSelectedIcon]}
                                onPress={this.toggleDrawer.bind(this)}
                            />
                            {'  ' + settingsService.visualizationFunction(replacePatterns(constants.navigation.titles.settingsScreen))}
                        </Text>
                    </TouchableOpacity>

                    <ItemSeparator style={styles.listItemSeparatorBlack} />
                </View>
            </View>
        )
    }

    /**
     * closes the navigation drawer
     */
    async toggleDrawer() {
        this.props.navigation.closeDrawer()
    }

    async onPress(route) {
        if (this.props.activeItemKey === route) {
            this.props.navigation.closeDrawer()
        } else {
            this.props.navigation.navigate(
                route,
                {
                    index: undefined,
                    backButton: false,
                }
            );
        }
    };

    _getListEmptyComponent() {
        return (
            this.state.nothingFound ?
                <Text style={[styles.listItem, styles.iconListItemLessons, customStyles.noVideosAvailableText]}>Keine Lektionen heruntergeladen.</Text> :
                <ActivityIndicator
                    size={'large'}
                    color={constants.colors.lightblue}
                />
        )
    }

    _renderWordList(item) {
        return (
            <View
                style={[styles.container, styles.containerLesson, styles.containerLessonMargin]}
                onLayout={(event) => {
                    let {height} = event.nativeEvent.layout;
                    (!this.state.listItemHeight) && this.setState({listItemHeight: height})
                }}
            >
                <TouchableHighlight
                    style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, (this.props.activeItemKey === constants.navigation.keys.vocabularyViewStack) && this.state.selectedLessonId === item.item.id && customStyles.drawerSelectedItem,{height: this.state.listItemHeight}]}
                    accessible={true}
                    accessibilityLabel={`Lektion ${item.item.readableName} anzeigen`}
                    accessibilityHint={`Die Gebärden der Lektion ${item.item.readableName} werden angezeigt`}
                    onPress={() => this._viewLesson(item.item)}
                    underlayColor={constants.colors.lightblue}
                >
                    <View style={[styles.touchableHighlightIconWrapper]}>
                        <Text
                            style={[styles.iconListItem, styles.iconListItemLessons, (this.props.activeItemKey === constants.navigation.keys.vocabularyViewStack) && this.state.selectedLessonId === item.item.id && customStyles.drawerSelectedText]}
                            numberOfLines={1}
                        >
                            {settingsService.visualizationFunction(item.item.readableName)}
                        </Text>
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

    _renderSectionHeader(item) {
        if (item.section.title === constants.allOption) {
            return null
        }
        return (
            <SectionHeader
                setItemLayout={(height) =>
                    (!this.state.sectionHeaderHeight) && this.setState({ sectionHeaderHeight: height }
                    )}
                itemSeparator={<ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]} />}
                height={this.state.sectionHeaderHeight}
                item={item.section.title}
            />
        )
    }

    _sortArray(words) {
        //sort array first by the sort value, then by its name
        return words.sort((a, b) => (a.sort ? (b.sort ? a.sort - b.sort : -1) : (b.sort ? 1 : 0)
        ) || a.sortableName.localeCompare(b.sortableName))
    }

    async _getAllLessons() {
        this.setState(
            {
                nothingFound: false,
            }
        )
        return lessonService.findAllAvailableLessons(this.state.currentFilter, this.receiveAvailableLessons.bind(this))
    }

    /**
     * prepare data for the format of the section list
     * @param lessons lessons to prepare for the section list
     * @returns {Array} an array in the format required for the section list, containing objects of style {title: <section-title>, data: [<data>,...]}
     * @private
     */
    _prepareSectionsForList(lessons) {
        let packages = Array.from(new Set(lessons.map((value, index, array) => value.pack).filter(value => value !== null && value !== undefined)));
        packages.sort((a, b) => replaceForSort(a).localeCompare(replaceForSort(b)))
        let data = []
        for (let i = 0; i < packages.length; i++) {
            let section = {}
            section.title = packages[i]
            section.data = this._sortArray(lessons.filter(lesson => lesson.pack === packages[i]))
            data.push(section)
        }
        //add all data not having a package tag
        if (data.length > 0) {
            let section = {}
            section.title = '---'
            section.data = lessons.filter(lesson => lesson.pack === undefined || lesson.pack === null)
            if (section.data.length > 0) {
                data.push(section)
            }

            //add all option if required
            if (constants.allOption.toLowerCase().includes(this.state.currentFilter.toLowerCase()) && lessons.length > 0) {
                let section = {}
                section.title = constants.allOption
                section.data = [getAllLessonsOption()]
                data.unshift(section)
            }
        } else {

            let section = {}
            section.title = constants.allOption
            section.data = lessons.filter(lesson => lesson.pack === undefined || lesson.pack === null)

            if (constants.allOption.toLowerCase().includes(this.state.currentFilter.toLowerCase()) && lessons.length > 0) {
                section.data.unshift(getAllLessonsOption())
            }
            if (section.data.length > 0) {
                data.push(section)
            }
        }


        return data
    }


    async receiveAvailableLessons(lessons) {
        if (lessons) {
            let data = this._prepareSectionsForList(lessons)

            if (this._mounted) {
                this.setState({
                    filteredLessons: data || [],
                    nothingFound: lessons.length === 0,
                })
            } else {
                this.state.filteredLessons = data || []
                this.state.nothingFound = lessons.length === 0
            }
        } else {
            if (this._mounted) {
                this.setState({
                    filteredLessons: [],
                    nothingFound: lessons.length === 0,
                })
            } else {
                this.state.filteredLessons = []
                this.state.nothingFound = lessons.length === 0
            }
        }
    }

    async _viewLesson(lesson) {
        this.props.navigation.state.selectedLessonId = lesson.id
        this.setState({
                selectedLessonId: lesson.id,
            }
        )
        this.toggleDrawer()
        this.props.navigation.navigate('VideoView', {
            lesson: lesson,
            currentFilter: '',
            words: [],
            index: 0,
        })
    }



}