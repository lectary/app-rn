import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SectionList} from 'react-native';
import styles from '../../styles/styles'
import lessonService, {getAllLessonsOption} from '../../services/LessonService'
import constants from '../../util/Constants'
import {Lesson} from '../../dto/Lesson';
import settingsService from '../../services/SettingsService';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SearchBar} from 'react-native-elements';
import ListItem from '../util/ListItem'
import SectionHeader from "../util/SectionHeader";
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

const customStyles = StyleSheet.create(
    {
        noVideosAvailableText: {
            textAlign: 'center',
        },
    }
)
/**
 * displays the list of vocabulary in the current lesson
 */
export default class VocabularyListComponent extends Component {

    constructor(props) {
        super(props)

        let lesson = this.props.navigation.getParam('lesson')
        if (lesson) {
            if (lesson.isSearch) {
                lesson = lesson.oldLesson
            }
        } else {
            lesson = getAllLessonsOption()
        }

        let sections = this._prepareDataForSectionList(props.words, lesson)

        this.state = {
            lesson: lesson,
            nothingFound: false,
            words: props.words || [],
            filteredWords: sections || [],
            currentFilter: this.props.navigation.getParam('currentFilter', ''),
        }
    }

    componentWillMount() {
        if (this.state.lesson.isSearch) {
            //repacle the lesson with the all option or the lesson before if it was a search before
            this.state.lesson = this.state.lesson.oldLesson || getAllLessonsOption()
        }
    }

    componentDidMount() {
        this._mounted = true
        if (this.state.words.length === 0) {
            this._getWords(this.state.currentFilter, this.receiveData.bind(this))
        }
    }

    componentWillUnmount() {
        this._mounted = false
    }

    componentWillReceiveProps(props) {
        this.props = props
        let lesson = this.props.navigation.getParam('lesson')
        let currentFilter = this.props.navigation.getParam('currentFilter', '')
        if (lesson) {
            if (lesson.isSearch) {
                lesson = lesson.oldLesson
            }
        } else {
            lesson = getAllLessonsOption()
        }
        this.setState({
            lesson: lesson,
            currentFilter: currentFilter
        }, () => componentDidMount())
    }

    render() {
        return (
            <View style={[styles.container]}>
                <TouchableOpacity
                    style={styles.iconButtonContainer}
                    onPress={() => this._showVideo({index: undefined}, '', this.props.navigation.getParam('words', []))}
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
                                settingsService.visualizationFunction(
                                    this.state.lesson.readableName
                                )
                            }
                        </Text>
                    </View>
                    <View style={styles.headerIconWrapper}>
                        <Icon
                            name='times'
                            style={styles.headerIcon}
                        />
                    </View>
                </TouchableOpacity>
                <View style={[styles.container,styles.darkBackground]}>
                    <SectionList
                        sections={this.state.filteredWords}
                        renderItem={this._renderWordList.bind(this)}
                        renderSectionHeader={this._renderSectionHeader.bind(this)}
                        keyExtractor={(item, index) => (item.id + ' ' + index)}
                        initialNumToRender={40}
                        keyboardShouldPersistTaps='handled'
                        ListEmptyComponent={this._getListEmptyComponent.bind(this)}
                        getItemLayout={sectionListGetItemLayout({
                            getItemHeight: (rowData, sectionIndex, rowIndex) => this.state.listItemHeight ||44,
                            getSectionHeaderHeight: (sectionIndex) => {
                                if(sectionIndex === 0 && this.state.filteredWords[0].title === constants.allOption) {
                                    return 0
                                } else if(sectionIndex === this.state.filteredWords-1 && this.state.filteredWords[this.state.filteredWords-1].title === constants.deleteAllOption ) {
                                    return 0
                                }
                                return this.state.sectionHeaderHeight ||30.9
                            }
                        })
                        }
                        removeClippedSubviews={false}
                        indicatorStyle={'white'}
                    />
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
                        onCancel={async () => this._filterWords('')}
                        onClear={async () => this._filterWords('')}
                        onSearch={this._filterWords.bind(this)}
                        onChangeText={this._filterWords.bind(this)}
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
                </View>
            </View>
        );
    }

    /**
     * opens the navigation drawer
     */
    async _toggleDrawer() {
        this.props.navigation.openDrawer()
    }

    /**
     * searches for the words of the current lesson and containing the give filter
     *
     * @param {*} filter the filter to apply on the search
     * @param {*} callback the callback to return the data to
     */
    async _getWords(filter, callback) {
        lessonService.findAllWords(this.state.lesson, filter, callback)
    }

    /**
     * switches to the video view of the current lesson
     * @param {*} word the word to show the video of
     * @param {*} currentFilter the current filter that has been applied
     * @param {*} allWords the words to retun if given
     */
    async _showVideo(word, currentFilter, allWords = undefined) {
        let lesson = this.state.lesson
        if (currentFilter && currentFilter.length > 0) {
            let name = `Suche: "${currentFilter}"`
            lesson = new Lesson()
            lesson.readableName = name
            lesson.sortableName = name
            lesson.name = name
            lesson.id = -1
            lesson.oldLesson = this.state.lesson
            lesson.isSearch = true
        } else if (lesson.isSearch) {
            lesson = lesson.oldLesson || getAllLessonsOption()
        }
        let words = allWords

        if(!allWords) {
            words = [].concat.apply([],this.state.filteredWords.map((value) => value.data))
        }
        let index = words.indexOf(word.item)
        //console.log('index')
        //console.log(index)
        this.props.navigation.navigate('VideoView', {
            lesson: lesson,
            index: index,
            words: words,
            currentFilter: currentFilter
        })
    }

    _renderWordList(item, index, section) {
        let showLessonName
        if(this.state.lesson.name === constants.allOption) {

            showLessonName = (item.index > 0 && this.state.words[item.index-1].readableName === item.item.readableName)
                || (item.index < this.state.words.length-1 && this.state.words[item.index+1].readableName === item.item.readableName)
        } else {
            showLessonName = false
        }
        return (
            <ListItem
                item={item}
                height={this.state.listItemHeight}
                setItemLayout={(height) =>
                    !this.state.listItemHeight && this.setState({listItemHeight : height}
                    )}
                showLessonName={showLessonName}
                onPress={this.onWordPressed.bind(this)}/>

        )
    }

    _renderSectionHeader(item) {
        if(item.section.title === constants.allOption ||
            (this.state.currentFilter === ''))  {
            return null
        }
        return (
            <SectionHeader
                setItemLayout={(height) =>
                    (!this.state.sectionHeaderHeight) && this.setState({sectionHeaderHeight : height}
                    )}
                height={this.state.sectionHeaderHeight}
                item={item.section.title}
            />
        )
    }

    _getListEmptyComponent() {
        return (
            this.state.nothingFound ?
                <Text style={[styles.listItem, customStyles.noVideosAvailableText]}>Keine Vokabel gefunden.</Text> :
                <ActivityIndicator
                    color={constants.colors.lightblue}
                    size={'large'}
                />
        )
    }

    /**
     * if a word has been pressed, call the onWordPressed method given by the parent
     * @param {*} item the item that has been pressed
     */
    async onWordPressed(item) {
        this._showVideo(item, this.state.currentFilter)

    }

    /**
     * filters the data by the given word
     * @param {*} filterWord the word to filter the data by
     */
    async _filterWords(filterWord) {
        this.state.currentFilter = filterWord

        this.setState({
            nothingFound: false
        }, () => this._getWords(this.state.currentFilter, this.receiveData.bind(this)))
    }

    _prepareDataForSectionList(words, lesson) {
        let data = []
        let section = {}
        if(words && (lesson.name === constants.allOption)) {
            section.title = constants.allOption
            section.data = words
            data.push(section)
        } else if(words) {
            let lessons = Array.from(new Set(words.map((value, index, array) => value.lesson.readableName)));
            lessons.sort((a, b) => a === lesson.readableName ? -1 : (b === lesson.readableName ? 1 : 0))
            for(let i = 0; i < lessons.length; i++) {
                section = {}
                section.title = lessons[i]
                section.data = words.filter((value) => value.lesson.readableName === lessons[i])
                data.push(section)
            }
        }
        return data
    }

    /**
     * callback to receive data from the service
     * @param {*} data the data that has been received
     */
    async receiveData(data) {
        this.state.words = data
        let sections = this._prepareDataForSectionList(data, this.state.lesson)
        if (this._mounted) {
            this.setState(
                {
                    filteredWords: sections,
                    nothingFound: data.length === 0
                }
            )
        } else {
            this.state.filteredWords = data
        }
    }
}
