import settingsPersistence from '../persistence/SettingsPersistence'
import constants from '../util/Constants'

/**
 * service class to handle everything regarding settings
 */
class SettingsService {

    constructor() {
        //on object creation load all settings and store them
        settingsPersistence.getAllSettings().then((settings) => {
            this.settings = settings
            //if a setting has not been persisted yet, set it to the default
            if (this.settings.autoplay === undefined || this.settings.autoplay === null) {
                this.settings.autoplay = constants.settings.defaults.autoplay
            }
            if (this.settings.capitalized === undefined || this.settings.capitalized === null) {
                this.settings.capitalized = constants.settings.defaults.capitalized
            }
            if (this.settings.repeat === undefined || this.settings.repeat === null) {
                this.settings.repeat = constants.settings.defaults.repeat
            }
            if (this.settings.extendedControls === undefined || this.settings.extendedControls === null) {
                this.settings.extendedControls = constants.settings.defaults.extendedControls
            }
            if (this.settings.muted === undefined || this.settings.muted === null) {
                this.settings.muted = constants.settings.defaults.muted
            }
            if (this.settings.showSeekbar === undefined || this.settings.showSeekbar === null) {
                this.settings.showSeekbar = constants.settings.defaults.showSeekbar
            }
            if (this.settings.overlay === undefined || this.settings.overlay === null) {
                this.settings.overlay = constants.settings.defaults.overlay
            }
            if (this.settings.reverseLearningDirection === undefined || this.settings.reverseLearningDirection === null) {
                this.settings.reverseLearningDirection = constants.settings.defaults.reverseLearningDirection
            }
        })
    }

    async getSetting(key) {
        if(!this.settings) {
            return await this._getSetting(key)
        } else {
            return this.settings[key]
        }
    }

    async setSetting(key, value) {
        if(!this.settings) {
            this.settings = {}
        }
        this.settings[key] = value
        settingsPersistence.setSetting(key, value)
    }

    async _getSetting(key) {
        let setting = await settingsPersistence.getSetting(key)
        if(setting === undefined || setting === null) {
            setting = constants.settings.defaults[key]
        }
        return setting
    }

    /**
     * a function to visualize all text modalVisible to the user,
     * in this case capitalizes everything if the capitalized option is enabled
     */
    visualizationFunction = (word) => {
        if (this.settings && this.settings.capitalized && word) {
            return word.toUpperCase()
        } else {
            return word
        }
    }

    /**
     * saves all values currently available in the persistence
     */
    save() {
        for (let value in this.settings) {
            settingsPersistence.setSetting(value, settings[value])
        }
    }
}

export default settingsService = new SettingsService()