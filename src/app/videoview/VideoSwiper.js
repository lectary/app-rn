import React, {Component} from 'react'
import styles from '../../styles/styles'
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Animated} from 'react-native';
import VideoComponent from './VideoComponent'
import lessonService, {getAllLessonsOption} from '../../services/LessonService'
import Carousel from 'react-native-snap-carousel'
import constants from '../../util/Constants'
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon2 from 'react-native-vector-icons/FontAwesome5'
import settingsService from '../../services/SettingsService'
import LectaryIconSet from "../util/LectaryIconSet";
import DialogUtility from "../util/DialogUtility";

const customStyles = StyleSheet.create({
    videoContainer: {
        flex: 1,
    },
    settingsButtonContainer: {
        flex: 1,
        minHeight: 65,
        alignContent: 'stretch',
        backgroundColor: constants.colors.transparent,
    },
    buttonsDisabledLightgrey: {
        backgroundColor: 'lightgrey',
    },
    buttonsDisabledDarkgrey: {
      backgroundColor: 'darkgrey',
    },
    disabledHeaderIcon: {
        color: 'darkgrey',
    },
    buttonsDisabledDimgrey: {
        backgroundColor: 'dimgrey',
    },
    settingsButtonActive: {
        color: constants.colors.white,
    },
    randomizeButtonContainer: {
        flex: 1,
    },
    extendedControlsButtonContainer: {
        flex:1,
        backgroundColor: constants.colors.orange,
    },
    randomizeButton: {
        backgroundColor: constants.colors.violett,
    },
    reverseLearningDirectionButton: {
        backgroundColor: constants.colors.green,
    },
    randomizeIcon: {
        color: constants.colors.white,
        fontSize: 50
    },
    searchButtonContainer: {
        flex: 1,
    },
    searchButton: {
        backgroundColor: constants.colors.lightblue,
    },
    lowerButtonsRowContainer: {
        display: 'flex',
        flexDirection: 'row',
        flex: 0.3,
        alignContent: 'stretch',
        justifyContent: 'space-around',
    },
    button: {
        flex: 1,
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        alignContent: 'stretch'
    },
    swipeControlsOverlay: {
        position: 'absolute',
        color: constants.colors.white,
        opacity: 0.5,
        fontSize: 30,
        backgroundColor: 'transparent',
        height: '100%',
    },
    videoControlsOverlay: {
        position: 'absolute',
        opacity: 0.5,
        backgroundColor: constants.colors.white,
        textAlign: 'center',
        borderRadius: 10,
        bottom: 0,
        width: 50,
        fontWeight: 'bold',
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
    },
    overlayContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    noVideosAvailableText: {
        paddingHorizontal:20,
        //paddingVertical: 10,
        fontSize: 20,
        color: constants.colors.white,
        flex: 0,
        textAlign: 'center',
        alignContent: 'center',
        alignSelf: 'center',
    },
    noVideosAvailableSmallerText: {
        fontSize: 15,
        color: constants.colors.white,
    },
    noVideosAvailableIcon: {
        fontSize: 50,
        color: constants.colors.yellow,
        backgroundColor: constants.colors.transparent,
        flex: 0,
        textAlign: 'center',
        alignContent: 'center',
        alignSelf: 'center',
    },
    noVideosAvailableContainer: {
        textAlign: 'center',
        alignContent: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    noVideosAvailableButtonContainer: {
        flex:0,
        marginHorizontal:30,
        marginTop:10,
        marginBottom:5,
        paddingVertical: 15,
        borderRadius:10,
        textAlign: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        backgroundColor: constants.colors.lightblue,
    },
    noVideosAvailableButtonText: {
        color: constants.colors.black,
    },
    videoSettingsButton: {
        alignSelf: 'center', 
        fontSize: 30, 
        color: constants.colors.grey
    },
    videoSettingSpeedButton: {
        backgroundColor: constants.colors.yellow,
    },
    videoSettingAutostartButton: {
        backgroundColor: constants.colors.orange,
    },
    videoSettingRepeatButton: {
        backgroundColor: constants.colors.red,
    },
    buttonInactive: {
        color: constants.colors.grey,
    }

})

export default class VideoSwiper extends Component {
    constructor(props) {
        super(props)

        this.state = {
            words: this.props.navigation.getParam('words', []),
            lesson: this.props.navigation.getParam('lesson', getAllLessonsOption()),
            index: this.props.navigation.getParam('index', this.props.navigation.getParam('index', this.state ? this.state.index || 0 : 0)),
            currentFilter: this.props.navigation.getParam('currentFilter', ''),
            slow: false,
            showOverlay: true,
            carouselWidth: 200,
            carouselHeight: 200,
            repeat: false,
            videoHeigeht: 0,
            autoplay: false,
            startState: false,
            extendedControls: constants.settings.defaults.extendedControls,
            showSeekbar: constants.settings.defaults.showSeekbar,
            muted: constants.settings.defaults.muted,
            overlay: constants.settings.defaults.overlay,
            reverseLearningDirection: constants.settings.defaults.reverseLearningDirection,

        }

        this.videos = {}
    }

    componentDidMount() {
        this._mounted = true
        if (this.carousel) {
            this.carousel.triggerRenderingHack()
        }
        if (this.state.words.length === 0) {
            let lesson = this.props.navigation.getParam('lesson')
            lessonService.findAllWords(lesson, this.state.currentFilter, this.receiveWords.bind(this))
        } else {
            //if we already got the data snap to the correct index
            this._snapToItem(this.state.index)

        }

        this.getSettings()

    }

    async getSettings() {
        this._loadSettings()

    }

    componentWillUnmount() {
        /*set a boolean to false when unmounting to keep warning from happening if the component unmounts
        before the data from the database call arrives
        */
        this._mounted = false
        this.state.showOverlay = true
    }

    componentWillReceiveProps(props) {
        this.props = props
        let index = this.props.navigation.getParam('index')
        if (index === undefined) {
            index = this.state.index || 0
            this.lastWord = this.state.words[index]
        } else {
            this.lastWord = undefined
        }


        this.setState({
                words: this.props.navigation.getParam('words', []),
                index: index,
                slow: false,
                showOverlay: !this.state.autoplay,
                currentFilter: this.props.navigation.getParam('currentFilter', ''),
                lesson: this.props.navigation.getParam('lesson', getAllLessonsOption()),
            }, () => {
                this.componentDidMount()
            }
        )
    }

    _getNoVideoAvailableComponent() {
        return (
            <View
            style={[styles.container, customStyles.noVideosAvailableContainer]}
            >
                <Text style={[customStyles.noVideosAvailableText]}>
                    {settingsService.visualizationFunction('Keine Lektionen vorhanden.')}
                </Text>
                <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.container, customStyles.noVideosAvailableButtonContainer]}
                onPress={this._navigateToDownloadsView.bind(this)}
                >
                    <Text style={[customStyles.noVideosAvailableText, customStyles.noVideosAvailableButtonText]}>
                        {settingsService.visualizationFunction('Lektionen herunterladen und verwalten.')}
                    </Text>
                    <Icon
                        name='cloud-download'
                        style={[customStyles.noVideosAvailableIcon, customStyles.noVideosAvailableButtonText]}
                    />
                </TouchableOpacity>
                <Text style={[customStyles.noVideosAvailableText, customStyles.noVideosAvailableSmallerText]}>
                    {settingsService.visualizationFunction('Einzelne Lektionen sind ungefähr 5MB bis 20MB gross.')}
                </Text>
            </View>
            
        )
    }

    /**
     * Snaps to a given index if the carousel is mounted
     * @param {*} index the index to snap to
     */
    async _snapToItem(index) {
        if (this.carousel && (this.carousel !== null) && (this.state.words.length > 0)) {
            //Apparently waiting before snapping to let the list actually render helps to stop the carousel from not snapping
            //to the correct item
            let wait = new Promise((resolve) => setTimeout(resolve, 300));
            wait.then(() => {
                //console.log('snapping to: ' + index)

                this.carousel && this.carousel._snapToItem(index, false, true)


            });
        }
    }

    async _setOverlay(showOverlay) {
        this.setState(
            {
                showOverlay: showOverlay,
            }
        )
    }

    /**
     * swipes the carouselto the right
     */
    async _swipeRight() {
        if (this.carousel) {
            this.carousel.snapToNext(true, true)
        }
    }

    /**
     * swipes the carouselto the left
     */
    async _swipeLeft() {
        if (this.carousel) {
            this.carousel.snapToPrev(true, true)
        }
    }

    async _navigateToListView() {
        this.props.navigation.navigate(constants.navigation.keys.wordListScreen,
            {
                lesson: this.state.lesson, 
                currentFilter: this.state.currentFilter,
            }
        )
    }

    async _navigateToLessonsView() {
        this.props.navigation.navigate(constants.navigation.keys.lessonOverviewScreen,
            {
                lesson: this.state.lesson,
                backButton: true,
            }
        )
    }

    async _navigateToDownloadsView() {
        this.props.navigation.navigate(constants.navigation.keys.downloadScreen,
            {})
    }

    render() {
        return (
            <View style={[styles.container, styles.darkBackground]}>
                <View
                    disabled={this.state.startState}
                    style={styles.iconButtonContainer}
                    onPress={() => this._navigateToLessonsView()}
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
                            numberOfLines={1}
                        >
                            {
                                settingsService.visualizationFunction(this.state.startState ? 'Lectary' :  this.state.lesson.readableName)
                            }
                        </Text>
                    </View>
                    {this.state.lesson.isSearch ? 
                        <TouchableOpacity style={styles.headerIconWrapper}
                            onPress={this._cancelSearch.bind(this)}
                            //onPress={() => this._cancelSearch()} // das gleiche wie oben
                            disabled={!this.state.lesson.isSearch}
                        >        
                            <Icon2
                                name='times'
                                style={[styles.headerIcon, this.state.startState && customStyles.disabledHeaderIcon]}
                            />
                        </TouchableOpacity> : null
                    }
                </View>
                {this.state.startState ? this._getNoVideoAvailableComponent() : (
                    <View style={styles.container}>
                        <View
                            style={customStyles.videoContainer}
                            onLayout={(event) => {
                                let {width, height} = event.nativeEvent.layout
                                this.setState({
                                    carouselHeight: height,
                                    carouselWidth: width,
                                })
                            }}>
                            <Carousel
                                ref={(carousel) => this.carousel = carousel}
                                inactiveSlideScale={0.9}
                                inactiveSlideOpacity={1}
                                firstItem={this.state.index}
                                data={this.state.words}
                                nestedScrollEnabled={true}
                                initialNumToRender={1}
                                maxToRenderPerBatch={2}
                                swipeThreshold={10}
                                renderItem={this._createVideoComponent.bind(this)}
                                itemWidth={Dimensions.get('window').width}
                                sliderWidth={Dimensions.get('window').width}
                                onSnapToItem={this.indexChanged.bind(this)}
                                enableSnap
                                horizontal={true}
                                keyExtractor={(item, index) => item.id + '_' + index}
                                removeClippedSubviews={true}
                                //lockScrollWhileSnapping={true}
                                getItemLayout={(data, index) => ({
                                    offset: Dimensions.get('window').width * index,
                                    length: Dimensions.get('window').width,
                                    index
                                })}
                            />
                            {this.state.showOverlay ? this.createOverlayView() : null}
                        </View>
                    </View>
                )}
                {this.state.startState ? null :
                <View style={styles.rowContainer}>
                    <TouchableOpacity
                        style={[styles.iconContainer, customStyles.settingsButtonContainer, this.state.slow && customStyles.videoSettingSpeedButton, this.state.startState && customStyles.buttonsDisabledDarkgrey]}
                        accessible={true}
                        accessibilityLabel="Langsam abspielen"
                        accessibilityHint="Reduziert Geschwindigkeit des Videos auf 30%"
                        onPress={this._changeVideoSpeed.bind(this)}
                        disabled={this.state.startState}
                        activeOpacity={0.7}
                    >
                        <LectaryIconSet
                            name="turtle"
                            style={[customStyles.videoSettingsButton, this.state.slow && customStyles.settingsButtonActive]}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.iconContainer, customStyles.settingsButtonContainer, this.state.autoplay && customStyles.videoSettingAutostartButton, this.state.startState && customStyles.buttonsDisabledLightgrey]}
                        accessible={true}
                        accessibilityLabel="Automatisch abspielen"
                        accessibilityHint="Startet Videos automatisch"
                        onPress={this._toggleAutoplay.bind(this)}
                        activeOpacity={0.7}
                        disabled={this.state.startState}
                    >
                        <LectaryIconSet
                            name="auto-icon"
                            style={[customStyles.videoSettingsButton, this.state.autoplay && customStyles.settingsButtonActive]}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.iconContainer, customStyles.settingsButtonContainer, this.state.repeat && customStyles.videoSettingRepeatButton, this.state.startState && customStyles.buttonsDisabledDimgrey]}
                        accessible={true}
                        accessibilityLabel="Video wiederholen"
                        accessibilityHint="Videos beginnen nach dem Ende wieder von vorne"
                        onPress={this._toggleRepeat.bind(this)}
                        activeOpacity={0.7}
                        disabled={this.state.startState}
                    >
                        <LectaryIconSet
                            name="replay"
                            style={[customStyles.videoSettingsButton, this.state.repeat && customStyles.settingsButtonActive]}
                        />
                    </TouchableOpacity>
                </View>
                }
                {this.state.startState ? null :
                    <View style={customStyles.lowerButtonsRowContainer}>
                        <View style={customStyles.randomizeButtonContainer}>
                            <TouchableOpacity
                                disabled={this.state.startState}
                                style={[customStyles.button, customStyles.reverseLearningDirectionButton, this.state.startState && customStyles.buttonsDisabledDimgrey]}
                                accessible={true}
                                accessibilityLabel="Lernrichtung umkehren"
                                accessibilityHint="Die Bedeutung der Gebärden wird verdeckt um ein umgekehrtes Lernen zu ermöglichen"
                                onPress={this._toggleReverseLearningDirection.bind(this)}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    style={[customStyles.randomizeIcon, customStyles.buttonInactive, this.state.reverseLearningDirection && customStyles.settingsButtonActive]}
                                    name={this.state.reverseLearningDirection ? 'eye-slash' : 'eye'}/>
                            </TouchableOpacity>
                        </View>
                        <View style={customStyles.randomizeButtonContainer}>
                            <TouchableOpacity
                                disabled={this.state.startState}
                                style={[customStyles.button, customStyles.randomizeButton, this.state.startState && customStyles.buttonsDisabledDarkgrey]}
                                accessible={true}
                                accessibilityLabel="Zufällige Gebärde auswählen"
                                accessibilityHint="Eine zufällige Gebärde wird ausgewählt"
                                onPress={this._selectRandom.bind(this)}
                                activeOpacity={0.7}
                            >
                                <Icon2 style={customStyles.randomizeIcon} name="dice"/>
                            </TouchableOpacity>
                        </View>
                        <View style={customStyles.searchButtonContainer}>
                            <TouchableOpacity
                                disabled={this.state.startState}
                                style={[customStyles.button, customStyles.searchButton, this.state.startState && customStyles.buttonsDisabledLightgrey]}
                                accessible={true}
                                accessibilityLabel="Gebärde suchen"
                                accessibilityHint="Es wird auf die Liste aller Gebärden gewechselt"
                                onPress={() => this._navigateToListView(true)}
                                activeOpacity={0.7}
                            >
                                <Icon style={customStyles.randomizeIcon} name="search"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                }

                <DialogUtility
                    ref={(ref) => this.dialogUtility = ref}
                />
            </View>
        )
    }

    async _cancelSearch() {
        if (this.state.lesson && this.state.lesson.isSearch) {
            this.setState (
                {
                    lesson: this.state.lesson.oldLesson,
                    currentFilter: "",
                    index: 0,
                    words: [],
                },
                () => lessonService.findAllWords(this.state.lesson, this.state.currentFilter, this.receiveWords.bind(this))
            )
        }
    }

    _getVideoHeight() {
        if(this.videos && this.videos.length > 0) {
            let video = this.videos[this.state.index]
            this.setState(
                {
                    videoHeight: video._getVideoHeight(),
                }
            )
        }
    }

    createOverlayView() {
        if(!this.state.overlay) {
            return null
        }
        return (
            <View style={customStyles.overlayContainer}
                  pointerEvents='box-none'>
                {(this.state.index < this.state.words.length - 1 ?
                    <Icon
                        name='chevron-right'
                        style={[customStyles.swipeControlsOverlay, {
                            right: 0,
                            paddingTop: this.state.carouselHeight * 0.6 - (this.state.carouselHeight - this.state.videoHeight),
                            marginTop: (this.state.carouselHeight - this.state.videoHeight),
                            paddingLeft: Dimensions.get('window').width * 0.2
                        }]}
                        accessible={true}
                        accessibilityLabel="Nächstes Video"
                        accessibilityHint="Es wird auf das nächste Video gewechselt"
                        onPress={this._swipeRight.bind(this)}
                    /> : null)}
                {(this.state.index > 0 ?
                    <Icon
                        name='chevron-left'
                        style={[
                            customStyles.swipeControlsOverlay, {
                                left: 0,
                                paddingTop: this.state.carouselHeight * 0.6 - (this.state.carouselHeight - this.state.videoHeight),
                                marginTop: (this.state.carouselHeight - this.state.videoHeight),
                                paddingRight: Dimensions.get('window').width * 0.1
                            }]}
                        accessible={true}
                        accessibilityLabel="Vorheriges Video"
                        accessibilityHint="Es wird auf das vorherige Video gewechselt"
                        onPress={this._swipeLeft.bind(this)}
                    /> : null)}
            </View>
        )
    }

    /**
     * opens the navigation drawer
     */
    async _toggleDrawer() {
        this.props.navigation.openDrawer()
    }

    /**
     * called when the carousel is swiped, resets the previously playing video
     * @param {*} index the new index of the currently displayed video component
     */
    async indexChanged(index) {
        let video = this.videos[this.state.index]
        if (video) {
            video.reset()
        }
        video = this.videos[index]
        let height = video ? video.getVideoHeight() : this.state.carouselHeight
        this.setState({
            index: index,
            slow: false,
            showOverlay: !this.state.autoplay,
            videoHeight: height,

        }, () => this._handleAutoPlay())

    }

    /**
     * changes the speed of the video currently displayed
     * @param {*} amount speed to set the video to
     */
    async _changeVideoSpeed() {
        this.setState({slow: !this.state.slow}, () => {
            let video = this.videos[this.state.index]
            if (video) {
                video.setRate(this.state.slow ? 0.3 : 1)
            }
        })

    }

    /**
     * add a reference to a mounted video component
     */
    async _setMountedVideo(ref, index) {
        this.videos[index] = ref
        if (index === this.state.index) {
            if (this.state.autoplay) {
                this.videos[index]._play()
            }
            let height = ref.getVideoHeight()
            if(height !== this.state.videoHeight) {
                this.setState(
                    {
                        videoHeight: height
                    }
                )
            }
        }
    }

    /**
     * if the video shoud autoplay, the currently modalVisible video has to be automatically started
     * @param {*} index the index of the video to be automatically started if autoplay is enabled
     */
    async _handleAutoPlay() {
        if (this.state.autoplay) {
            let video = this.videos[this.state.index]

            if (video) {
                video._play()
            }
        }
    }

    /**
     * removes the reference to a video component
     */
    async _removeMountedVideo(ref, index) {
        if (this.videos[index] === ref) {
            delete this.videos[index]
        }
    }

    async _loadSettings() {
        let settings = [
            constants.settings.keys.autoplay,
            constants.settings.keys.repeat,
            constants.settings.keys.extendedControls,
            constants.settings.keys.showSeekbar,
            constants.settings.keys.reverseLearningDirection,
            constants.settings.keys.muted,
            constants.settings.keys.overlay
        ]
        for(let index in settings) {
            let key = settings[index]
            let value = await settingsService.getSetting(key)

            if(this.state[key] !== value) {
                let state = {}
                state[key] = value

                if(this._mounted){
                    await this.setState(state)
                } else {
                    this.state[key] = value
                }
            }
        }

        if(this._mounted) {
            this.setState(
                {
                    showOverlay: !this.state.autoplay
                },
                () => this._handleAutoPlay()
            )
        } else {
            this.state.showOverlay = !this.state.autoplay
        }
    }

    /**
     * method called by the flatlist that creates the videocomponent correctly
     * @param video the source for the video, consists of a dictionary given by the flatlist {item : Integer, video : Word}
     */
    _createVideoComponent(video) {
        return <VideoComponent
            word={video.item}
            key={video.index}
            index={video.index}
            repeat={this.state.repeat}
            autoplay={this.state.autoplay}
            muted={this.state.muted}
            reverseLearningDirection={this.state.reverseLearningDirection}
            overlay={this.state.overlay}
            showSeekbar={this.state.showSeekbar}
            onRef={this._setMountedVideo.bind(this)}
            onUnmount={this._removeMountedVideo.bind(this)}
            setPausedState={this._setOverlay.bind(this)}
            dialogUtility={this.dialogUtility}
        />
    }

    /**
     * callback for the persistence call to receive the data called for
     * @param {*} words
     */
    async receiveWords(words) {
        if (words) {
            let startState = false
            if (words.length === 0
                && this.state.lesson.name === constants.allOption
                && (!this.state.currentFilter || this.state.currentFilter.length === 0)) {
                startState = true
            }
            if (this.state.index > words.length) {
                this.state.index = words.length > 0 ? words.length - 1 : 0
            }
            if(this.lastWord) {
                let newIndex = words.map((value)=>value.id).indexOf(this.lastWord.id)
                if(newIndex < 0) {
                    newIndex = 0
                }
                this.state.index = newIndex
            }
            if (this._mounted) {
                this.setState({
                    words: words,
                    slow: false,
                    startState: startState,
                }, () => this._snapToItem(this.state.index))
            } else {
                //only set state if actually mounted
                this.state.words = words
                this.state.startState = startState
                this.state.slow = false
            }
        }
    }

    async _selectRandom() {
        const randomIndex = Math.floor(Math.random() * this.state.words.length)
        if (randomIndex === this.state.index) {
            let video = this.videos[this.state.index]
            if (video) {
                video.reset()
                this._handleAutoPlay()
            }
        }
        this.setState(
            {
                index: randomIndex,
                showOverlay: !this.state.autoplay,
                slow: false,
            }
        )
        this._snapToItem(randomIndex)
    }

    /**
     * toggles the repeat setting
     * @returns {Promise<void>}
     */
    async _toggleRepeat() {
        this.setState({
            repeat: !this.state.repeat
        }, () => {
            settingsService.setSetting(constants.settings.keys.repeat, this.state.repeat)
        })
    }

    /**
     * toggles the repeat setting
     * @returns {Promise<void>}
     */
    async _toggleReverseLearningDirection() {
        this.setState({
            reverseLearningDirection: !this.state.reverseLearningDirection
        }, () => {
            settingsService.setSetting(constants.settings.keys.reverseLearningDirection, this.state.reverseLearningDirection)
        })
    }

    /**
     * toggles the autoplay setting
     * @returns {Promise<void>}
     */
    async _toggleAutoplay() {
        this.setState({
            autoplay: !this.state.autoplay
        }, () => {
            settingsService.setSetting(constants.settings.keys.autoplay, this.state.autoplay)
        })
    }

}
