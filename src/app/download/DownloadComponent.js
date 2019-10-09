import React, {Component} from 'react';
import {
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    SectionList,
    TouchableHighlight,
    RefreshControl
} from 'react-native';
import styles from '../../styles/styles'
import lessonService, {getAllLessonsOption, getDeleteAllOption} from '../../services/LessonService'
import constants from '../../util/Constants'
import {SearchBar} from 'react-native-elements'
import DownloadButtonComponent from './DownloadButtonComponent'
import settingsService from '../../services/SettingsService'
import Icon from 'react-native-vector-icons/FontAwesome'
import {SafeAreaView} from 'react-navigation'
import {replaceForSort} from "../../util/ReplacementService";
import SectionHeader from "../util/SectionHeader";
import DialogUtility from "../util/DialogUtility";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import ItemSeparator from "../util/ItemSeparator";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import Modal from "react-native-modal";


const customStyles = StyleSheet.create({
    dialogContainer: {
        flex: 0,
        backgroundColor: constants.colors.white,
        alignSelf: 'flex-end',
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
    },
    deleteAllLessonsText: {
        color: constants.colors.red,
    },
    modalSafeAreaView: {
        flex: 1,
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
        backgroundColor: constants.colors.transparent,
    },
})

/**
 * a component to download new lessons that are available on lectary.net
 */
export default class DownloadComponent extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: constants.navigation.titles.downloadScreen
        }
    }

    constructor(props) {
        super(props)

        this.buttons = []
        this.state = {
            filteredLessons: [],
            allLessons: [],
            currentFilter: '',
            nothingFound: false,
            modalVisible: false,
            refreshing: false,
            modalLesson: {
                lesson: {}
            },
        }
    }

    async componentDidMount() {
        this._mounted = true

        this._getAllLessons()
    }

    async componentWillReceiveProps(props) {
        this.props = props
        this.state.allLessons.length = 0
        this.state.filteredLessons.length = 0
        this.componentDidMount()
    }

    componentWillUnmount() {
        this._mounted = false
    }

    async toggleDrawer() {
        this.props.navigation.openDrawer()
    }

    render() {
        return (
            <View style={[styles.container, styles.containerLesson]}>
                <View style={[styles.rowContainer, styles.containerLesson]}>
                    <TouchableOpacity
                        style={styles.headerIconWrapper}
                        accessible={true}
                        accessibilityLabel={`Navigation öffnen`}
                        accessibilityHint={`Die Navigation wird geöffnet`}
                        onPress={this.toggleDrawer.bind(this)}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name='bars'
                            style={styles.headerBurgerIcon}
                        />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={styles.heading}>
                            {settingsService.visualizationFunction(constants.navigation.titles.downloadScreen)}
                        </Text>
                    </View>
                </View>
                <ItemSeparator style={[styles.listItemSeparatorBlack]}/>
                <SectionList
                    ref={(ref) => this.searchList = ref}
                    style={styles.containerLesson}
                    sections={this.state.filteredLessons}
                    renderItem={this._renderLessonsList.bind(this)}
                    renderSectionHeader={this._renderSectionHeader.bind(this)}
                    keyExtractor={(item, index) => (item.id + ' ' + index)}
                    keyboardShouldPersistTaps='handled'
                    ListEmptyComponent={this._getListEmptyComponent.bind(this)}
                    initialNumToRender={40}

                    refreshControl={<RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefreshList.bind(this)}
                        title="Pull to refresh"
                        colors={[constants.colors.lightblue]}
                        tintColor={constants.colors.lightblue}
                        titleColor={constants.colors.lightblue}
                    />}
                    getItemLayout={sectionListGetItemLayout({
                            getItemHeight: (rowData, sectionIndex, rowIndex) => this.state.listItemHeight || 44,
                            getSectionHeaderHeight: (sectionIndex) => {
                                if (sectionIndex === this.state.filteredLessons - 1 && this.state.filteredLessons[this.state.filteredLessons - 1].title === constants.deleteAllOption) {
                                    return 0
                                }
                                return this.state.sectionHeaderHeight || 30.9
                            },
                        }
                    )}
                />
                <ItemSeparator style={[styles.listItemSeparatorBlack]}/>
                <SearchBar
                    ref={(searchbox) => this.searchbox = searchbox}
                    platform="ios"
                    containerStyle={styles.searchbox}
                    inputStyle={styles.searchbox}
                    inputContainerStyle={styles.searchbox}
                    placeholder={settingsService.visualizationFunction('Suche')}
                    placeholderTextColor={'black'}

                    value={this.state.currentFilter}
                    autoFocus={false}
                    onCancel={async () => this.filterLessons('')}
                    onClear={async () => this.filterLessons('')}
                    onSearch={this.filterLessons.bind(this)}
                    onChangeText={this.filterLessons.bind(this)}
                    clearIcon={
                        {
                            type: 'material-community',
                            size: 26,
                            name: 'close',
                            iconStyle: styles.searchboxClearIcon,
                        }
                    }
                    icon={
                        {
                            type: 'material',
                            name: 'search',
                            style: styles.searchboxSearchIcon,
                        }
                    }
                    cancelButtonProps={
                        {
                            color: constants.colors.lightblue
                        }
                    }
                />

                <DialogUtility
                    ref={(ref) => this.dialogUtility = ref}
                />

                <Modal
                    style={{margin: 0}}
                    isVisible={this.state.modalVisible}
                    onBackButtonPress={this.hideModal.bind(this)}
                    onBackdropPress={this.hideModal.bind(this)}
                >
                    <SafeAreaView
                        style={[customStyles.modalSafeAreaView]}
                    >
                        <View
                            style={[customStyles.dialogContainer]}
                        >
                            <Text
                                style={[customStyles.dialogText, customStyles.dialogHeaderText]}
                            >
                                {settingsService.visualizationFunction(`Lektion: ${this.state.modalLesson.lesson.readableName}`)}
                            </Text>
                            {this.state.modalLesson.lesson.pack ?
                                <Text style={[customStyles.dialogText]}>
                                    {settingsService.visualizationFunction(`Paket: ${this.state.modalLesson.lesson.pack}`)}
                                </Text> : null
                            }
                            {this.state.modalLesson.lesson.fileSize ?
                                <Text style={[customStyles.dialogText]}>
                                    {settingsService.visualizationFunction(`Dateigröße: ${this.state.modalLesson.lesson.fileSize} MB`)}
                                </Text> : null
                            }
                            {this.state.modalLesson.lesson.vocableCount ?
                                <Text style={[customStyles.dialogText]}>
                                    {settingsService.visualizationFunction(`Vokabel: ${this.state.modalLesson.lesson.vocableCount}`)}
                                </Text> : null
                            }
                            <ItemSeparator
                                style={styles.listItemSeparatorBlack}
                            />

                            {this.state.modalLesson.exists && this.state.modalLesson.updateable ?
                                <View>
                                    <TouchableHighlight
                                        style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                                        accessible={true}
                                        accessibilityLabel={`Lektion ${this.state.modalLesson.lesson.readableName} aktualisieren`}
                                        accessibilityHint={`Lektion ${this.state.modalLesson.lesson.readableName} wird aktualisiert`}
                                        onPress={() => {
                                            this.hideModal()
                                            this.state.modalLesson.update()
                                        }
                                        }
                                        underlayColor={constants.colors.lightblue}
                                    >
                                        <View style={[styles.touchableHighlightIconWrapper]}>
                                            <View style={
                                                [styles.iconContainer, styles.iconMinWidth]
                                            }>
                                                <Icon2
                                                    name='sync'
                                                    style={styles.iconButton}
                                                    width={44}
                                                />
                                            </View>
                                            <Text
                                                style={[styles.iconListItem, styles.iconListItemLessons,]}
                                                numberOfLines={1}
                                            >
                                                {settingsService.visualizationFunction("Aktualisieren")}
                                            </Text>

                                        </View>

                                    </TouchableHighlight>
                                    <ItemSeparator
                                        style={styles.listItemSeparatorBlack}
                                    />
                                </View>
                                : null
                            }

                            {this.state.modalLesson.exists ?
                                <View>
                                    <TouchableHighlight
                                        style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                                        accessible={true}
                                        accessibilityLabel={`Lektion ${this.state.modalLesson.lesson.readableName} löschen`}
                                        accessibilityHint={`Lektion ${this.state.modalLesson.lesson.readableName} wird gelöscht`}
                                        onPress={() => {
                                            this.hideModal()
                                            this.state.modalLesson.delete()
                                        }}
                                        underlayColor={constants.colors.lightblue}
                                    >
                                        <View style={[styles.touchableHighlightIconWrapper]}>
                                            <View style={
                                                [styles.iconContainer, styles.iconMinWidth]
                                            }>
                                                <Icon
                                                    name='trash'
                                                    style={[styles.iconButton, customStyles.deleteAllLessonsText]}
                                                    width={44}
                                                />
                                            </View>
                                            <Text
                                                style={[styles.iconListItem, styles.iconListItemLessons, customStyles.deleteAllLessonsText]}
                                                numberOfLines={1}
                                            >
                                                {settingsService.visualizationFunction("Löschen")}
                                            </Text>

                                        </View>

                                    </TouchableHighlight>
                                    <ItemSeparator
                                        style={styles.listItemSeparatorBlack}
                                    />
                                </View> : null}


                            {this.state.modalLesson.exists ? null :
                                <View>
                                    <TouchableHighlight
                                        style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                                        accessible={true}
                                        accessibilityLabel={`Lektion ${this.state.modalLesson.lesson.readableName} herunterladen`}
                                        accessibilityHint={`Lektion ${this.state.modalLesson.lesson.readableName} wird heruntergeladen`}
                                        onPress={() => {
                                            this.hideModal()
                                            this.state.modalLesson.download()
                                        }
                                        }
                                        underlayColor={constants.colors.lightblue}
                                    >
                                        <View style={[styles.touchableHighlightIconWrapper]}>
                                            <View style={
                                                [styles.iconContainer, styles.iconMinWidth]
                                            }>
                                                <Icon
                                                    name='cloud-download'
                                                    style={styles.iconButton}
                                                    width={44}
                                                />
                                            </View>
                                            <Text
                                                style={[styles.iconListItem, styles.iconListItemLessons,]}
                                                numberOfLines={1}
                                            >
                                                {settingsService.visualizationFunction("Herunterladen")}
                                            </Text>

                                        </View>
                                    </TouchableHighlight>
                                    <ItemSeparator
                                        style={styles.listItemSeparatorBlack}
                                    />
                                </View>}


                            <TouchableHighlight
                                style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                                accessible={true}
                                accessibilityLabel={`Dialog schließen`}
                                accessibilityHint={`Dialog wird ohne ausgeführter Aktion geschlossen`}
                                onPress={() => this.hideModal()}
                                underlayColor={constants.colors.lightblue}
                            >
                                <View style={[styles.touchableHighlightIconWrapper]}>
                                    <View style={
                                        [styles.iconContainer, styles.iconMinWidth]
                                    }>
                                        <Icon
                                            name='times'
                                            style={styles.iconButton}
                                            width={44}
                                        />
                                    </View>
                                    <Text
                                        style={[styles.iconListItem, styles.iconListItemLessons,]}
                                        numberOfLines={1}
                                    >
                                        {settingsService.visualizationFunction("Abbrechen")}
                                    </Text>

                                </View>
                            </TouchableHighlight>
                            <ItemSeparator
                                style={styles.listItemSeparatorBlack}
                            />
                        </View>
                    </SafeAreaView>
                </Modal>
            </View>
        );
    }

    _sortArray(words) {
        //sort array first by the sort value, then by its name
        return words.sort((a, b) => (a.sort ? (b.sort ? a.sort - b.sort : -1) : (b.sort ? 1 : 0)
        ) || a.sortableName.localeCompare(b.sortableName))
    }

    _getListEmptyComponent() {
        return (
            this.state.nothingFound ?
                <Text style={[styles.listItem, styles.iconListItemLessons, customStyles.noVideosAvailableText]}>Keine
                    Lektionen gefunden.</Text> :
                (this.state.refreshing ? null :
                    <ActivityIndicator
                        color={constants.colors.lightblue}
                        size={'large'}
                    />)
        )
    }

    _renderLessonsList(item) {
        if (item.item.readableName === constants.deleteAllOption) {
            return (
                <View
                    style={[styles.container, styles.containerLesson, styles.containerLessonMargin]}
                >
                    <TouchableHighlight
                        style={[styles.rowContainer, styles.iconButtonContainer, styles.iconButtonContainerLesson, {height: this.props.height}]}
                        onPress={() => this._deleteAllLessons()}
                        underlayColor={constants.colors.lightblue}
                    >
                        <View style={[styles.touchableHighlightIconWrapper]}>
                            <View style={
                                [styles.iconContainer, styles.iconMinWidth]
                            }>
                                <Icon
                                    name='trash'
                                    style={[styles.iconButton, customStyles.deleteAllLessonsText]}
                                    width={44}
                                />
                            </View>
                            <Text
                                style={[styles.iconListItem, styles.iconListItemLessons, customStyles.deleteAllLessonsText]}
                                numberOfLines={1}
                            >
                                {settingsService.visualizationFunction(`Alle Lektionen löschen`)}
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
        return (
            <DownloadButtonComponent
                lesson={item.item}
                update={this._getAllLessons.bind(this)}
                height={this.state.listItemHeight}
                navigateTo={this._viewLesson.bind(this)}
                showModal={this.showModal.bind(this)}
                setItemLayout={(height) =>
                    (!this.state.listItemHeight) && this.setState({listItemHeight: height}
                    )}
            />
        )
    }

    async showModal(modalLesson) {
        if (!this.state.modalVisible) {
            this.setState(
                {
                    modalLesson: modalLesson,
                    modalVisible: true,
                }
            )
        }
    }

    async hideModal() {
        this.setState(
            {
                modalVisible: false,
            }
        )
    }

    _renderSectionHeader(item) {
        return (
            <SectionHeader
                setItemLayout={(height) =>
                    (!this.state.sectionHeaderHeight) && this.setState({sectionHeaderHeight: height}
                    )}
                itemSeparator={<ItemSeparator style={[styles.listItemSeparatorBlack, styles.containerLessonMargin]}/>}
                height={this.state.sectionHeaderHeight}
                item={item.section.title}
            />
        )
    }

    async filterLessons(filterWord) {
        this.state.currentFilter = filterWord
        this.state.filteredLessons = []
        let filteredLesson = []
        for (let i = 0; i < this.state.allLessons.length; i++) {
            let section = {}
            section.title = this.state.allLessons[i].title
            section.data = this.state.allLessons[i].data.filter((lesson) => lesson.readableName.toLowerCase().includes(filterWord.toLowerCase()))
            if (section.title !== '---') {
                this._sortArray(section.data)
            }
            if (section.data.length > 0) {
                filteredLesson.push(section)
            }
        }
        this.setState(
            {
                nothingFound: false,
                filteredLessons: [],
            }, () => this.setState(
                {
                    filteredLessons: filteredLesson,
                }, () => this.setState(
                    {
                        nothingFound: this.state.filteredLessons.length === 0
                    }
                )
            )
        )
    }


    async receiveAllLessons(lessons) {
        if (lessons) {
            let packages = Array.from(new Set(lessons.map((value) => value.pack).filter(value => value !== null && value !== undefined)));
            packages.sort((a, b) => replaceForSort(a).localeCompare(replaceForSort(b)))
            let data = []
            for (let i = 0; i < packages.length; i++) {
                let section = {}
                section.title = packages[i]
                section.data = this._sortArray(lessons.filter(lesson => lesson.pack === packages[i]))
                data.push(section)
            }
            let section = {}
            section.title = '---'
            section.data = lessons.filter(lesson => lesson.pack === undefined || lesson.pack === null)
            section.data.push(getDeleteAllOption())
            if (section.data.length > 0) {
                data.push(section)
            }
            this.setState(
                {
                    allLessons: data,
                    filteredLessons: data,
                    nothingFound: lessons.length === 0,
                    refreshing: false,
                },
                () => this.filterLessons(this.state.currentFilter)
            )
        } else {
            this.setState(
                {
                    nothingFound: true,
                    refreshing: false,
                }
            )
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Lektionen konnten nicht geladen werden, bitte überprüfen Sie Ihre Internetverbindung.'],
                    informationDialogTitle: 'Fehler beim Laden der Lektionen.',
                }
            )
        }
    }

    async _getAllLessons() {

        this.setState(
            {
                allLessons: [],
                filteredLessons: [],
            }, () => lessonService.findAllOnlineLessons(this.receiveAllLessons.bind(this))
        )

    }

    async _viewLesson(lesson) {
        this.props.navigation.dangerouslyGetParent().state.selectedLessonId = lesson.id
        this.props.navigation.navigate('VideoView', {
            lesson: lesson,
            words: [],
            index: 0,
            currentFilter: ''
        })
    }

    async _deleteAllLessons() {
        this.dialogUtility && this.dialogUtility.showConfirmationDialog(
            {
                confirmationDialogText: [`Möchten Sie wirklich alle Lektionen löschen?`],
                onConfirmationPress: () => lessonService.deleteAllLessons(this.receiveAllLessonsDeletionSuccess.bind(this)),
                confirmationDialogSubmissionButtonText: `Alle Löschen`,
                confirmationDialogSubmissionButtonStyle: {color: constants.colors.red},
                confirmationDialogCancelButtonText: `Abbrechen`,
            }
        )

    }

    async receiveAllLessonsDeletionSuccess(success) {
        if (success) {
            this._viewLesson(getAllLessonsOption())
        } else {
            this.dialogUtility && this.dialogUtility.showInformationDialog(
                {
                    informationDialogText: ['Bitte versuchen Sie es erneut.'],
                    informationDialogTitle: 'Fehler beim Löschen der Lektionen!',
                }
            )
        }
    }

    async _onRefreshList() {
        this.setState(
            {
                refreshing: true,
                allLessons: [],
                fileteredLessons: [],
            }, () => this._getAllLessons()
        )
    }

}