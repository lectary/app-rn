import React, {Component} from 'react'
import {Text, TouchableWithoutFeedback, View, Dimensions, ActivityIndicator, StyleSheet, AppState} from 'react-native'
import Video from 'react-native-video'
import styles from '../../styles/styles'
import settingsService from '../../services/SettingsService'
import Icon from 'react-native-vector-icons/FontAwesome'
import constants from '../../util/Constants'
import {Bar} from 'react-native-progress'
import {ScrollView} from "react-native-gesture-handler";
import ProgressBar from "./ProgressBar"
import DialogUtility from "../util/DialogUtility";

const customStyles = StyleSheet.create({
    videoContainer: {
        flex: 1,
    },
    video: {
        width: Dimensions.get('window').width,
        height: 600 * (Dimensions.get('window').width / 800),
        maxHeight: Dimensions.get('window').width,
        alignSelf: 'flex-end'
    },
    overlayPlayButton: {
        position: 'absolute',
        color: constants.colors.white,
        width: Dimensions.get('window').width,
        opacity: 0.5,
        bottom: 0,
        fontSize: 150,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    reverseLearningShowIcon: {
        position: 'absolute',
        color: constants.colors.green,
        opacity: 0.8,    
        left:10,
        bottom:2,
        fontSize: 100,
    },
    videoHeadingContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    videoHeading: {
        flex:1,
        textAlign: 'left',
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        paddingLeft: 10,
        paddingRight:10,
        fontSize: 30,
        color: constants.colors.white,
    },
    progressBar: {
        color: constants.colors.yellow,
        width: '100%',
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 0,
        height: 4,
    },
    videoHeadingScrollContainer: {
        flex:0,
    },
    videoHeadingScrollContentContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
})
/**
 * a component to display a video with an optional overlay
 */
export default class VideoComponent extends Component {
    constructor(props) {
        super(props)

        this.state = {
            paused: true,
            rate: 1,
            mounted: false,
            height: 600 * (Dimensions.get('window').width / 800),
            word: this.props.word,
            showOverlay: !this.props.autoplay,
            showHeader: false,
            appState: AppState.currentState,
            time: 0,
        }
        this.setRate.bind(this)
        this.reset.bind(this)
        this._handleAppStateChange.bind(this)
    }

    componentDidMount() {
        this._mounted = true
        //console.log('mounting: ' + this.props.index)
        this.props.onRef(this, this.props.index)
        this.stateListener = AppState.addListener('appStateDidChange', this._handleAppStateChange.bind(this));
    }

    componentWillReceiveProps(props) {
        if (!this.props.autoplay && props.autoplay) {
            this.setState({
                showOverlay: true,
            })
        }
        this.props = props


    }

    componentWillUnmount() {
        this._mounted = false
        //console.log('unmounting: ' + this.props.index)
        this.props.onUnmount(this, this.props.index)
        this.stateListener && this.stateListener.remove()
    }

    async _handleAppStateChange(nextAppState) {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState.app_state === 'active'
        ) {
            this._mounted && this._pause()
            if(this.state.time >= 0.01) {
                this.videoPlayer && this.videoPlayer.seek(this.state.time - 0.01)
                this.state.time = this.state.time - 0.01
            } else {
                this.videoPlayer && this.videoPlayer.seek(0.01)
                this.state.time = 0.01
            }
        }
        this.state.appState = nextAppState.app_state;
    };

    render() {
        return (
            <View style={[styles.container, styles.darkBackground]}>
                <View style={customStyles.videoHeadingContainer}>

                    <ScrollView
                    style={customStyles.videoHeadingScrollContainer}
                    //horizontal={true}
                    //showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    contentContainerStyle={customStyles.videoHeadingScrollContentContainer}
                    >
                    {!this.props.reverseLearningDirection || this.state.showHeader ?
                    <Text
                        style={customStyles.videoHeading}
                        //ellipsizeMode={'tail'}
                        //numberOfLines={1}
                    >
                        {settingsService.visualizationFunction(this.state.word ? this.state.word.readableName : '')}
                    </Text>
                        : <Icon
                            name='eye'
                            style={[customStyles.reverseLearningShowIcon]}
                            onPress={this.showHeader.bind(this)}
                            />}

                    </ScrollView>
                </View>

                {this.state.word ? (
                    <TouchableWithoutFeedback
                        style={customStyles.videoContainer}
                        onPress={this._togglePause.bind(this)}>
                        <Video source={
                            {
                                uri: (this.state.word ? this.state.word.getPath() : ''),
                            }
                        }
                               style={customStyles.video}
                               muted={this.props.muted}
                               rate={this.state.rate}
                               height={this.state.height}
                               repeat={this.props.repeat}
                               ref={(ref) => {
                                   //store the reference to the player
                                   this.videoPlayer = ref
                               }}
                               progressUpdateInterval={25}
                               onProgress={this.state.paused ? undefined : ((progress) => {
                                   this.state.time = progress.currentTime
                                   !this.state.paused && this.progressBar && this.progressBar.updateProgress(progress.currentTime / progress.seekableDuration)
                               })}
                               paused={this.state.paused}
                               resizeMode='contain'
                               posterResizeMode={'contain'}
                               onEnd={this.state.paused ? undefined : (async () => {
                                   //_pause the video after it played
                                   if (this._mounted) {
                                       this.progressBar && this.progressBar.updateProgress(1)
                                   }
                                   if (!this.props.repeat) {
                                       this._pause().then(
                                           () => {
                                               this.state.time = 0
                                               this.videoPlayer.seek(0)
                                           }
                                       );
                                   }
                               })
                               }
                               onLoad={async (payload) => {
                                   //console.log('done ' + this.props.index)
                                   //console.log(payload)
                                   this.setState(
                                       {
                                           height: payload.naturalSize.height * (Dimensions.get('window').width / payload.naturalSize.width),
                                           done: true,
                                       }
                                   )
                                   this.videoPlayer.seek(0)
                               }
                               }
                               onError={async (err) => {
                                   //console.log('error ' + this.props.index + " : ");
                                   //console.log(err);
                                   this.props.dialogUtility.showInformationDialog(
                                       {
                                           informationDialogText: ['Video konnte nicht geladen werden, bitte starten Sie die App neu.'],
                                           informationDialogTitle: 'Fehler beim Laden des Videos.',
                                       }
                                   )
                               }
                               }
                        />
                    </TouchableWithoutFeedback>) : (
                    <ActivityIndicator
                        style={styles.activityIndicator}
                        size={'large'}
                        color={constants.colors.lightblue}
                        height={this.state.height / 2}
                    />)}
                {this.props.showSeekbar ?
                    <ProgressBar
                        ref={(ref) => this.progressBar = ref}
                    /> : null}
                {this.props.overlay && this.state.paused && (!this.props.autoplay || this.state.showOverlay) ?
                    this.state.done ?
                        <Icon
                            name='play-circle'
                            style={[customStyles.overlayPlayButton, {paddingBottom: this.state.height / 2 - 75}]}
                            accessible={true}
                            accessibilityLabel="Video Starten"
                            accessibilityHint="Das Video wird gestartet"
                            onPress={this._togglePause.bind(this)}
                        /> : <ActivityIndicator
                            size={'large'}
                            style={[customStyles.overlayPlayButton, {paddingBottom: this.state.height / 2 + 10}]}
                            color={constants.colors.white}
                        />
                    : null}

            </View>
        )

    }

    async showHeader() {
        this.props.setPausedState(this.state.paused)
        this.setState(
            {
                showHeader: true,
            }
        )
    }

    getVideoHeight() {
        return this.state.height || 0
    }

    /**
     * resets the video to 0 and normal rate and paused state
     */
    async reset() {
        this.setState({
                paused: true,
                rate: 1,
                showHeader: false,
            }, () => this.videoPlayer && this.videoPlayer.seek(0)
        )
        this.progressBar && this.progressBar.updateProgress(0)
        
    }

    /**
     * sets the rate of the current video
     * @param {*} rate rate to set the video playback to
     */
    async setRate(rate) {
        this.setState(
            {
                rate: rate,
            }
        )
    }

    /**
     * plays the video and makes the overlay disappear
     */
    async _play() {
        this.setState({
            paused: false,
            showOverlay: false,
        }, () => this.props.setPausedState && this.props.setPausedState(false))
    }

    /**
     * pauses the video and makes the overlay appear
     */
    async _pause() {
        await this.setState({
            paused: true,
            showOverlay: true,
        }, () => this.props.setPausedState && this.props.setPausedState(true))
    }

    /**
     * toggles the video _play or _pause
     */
    async _togglePause() {
        if (this.state.done) {
            if (this.state.paused) {
                this._play()
            } else {
                this._pause()
            }
        }
    }
}