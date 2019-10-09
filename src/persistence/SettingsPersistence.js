import {AsyncStorage} from 'react-native'

/**
 * class responsible for persisting the settings using the AsyncStorage of react-native
 */
class SettingsPersistence {

    constructor() {

    }

    /**
     * stores a setting in the persistence
     * @param {*} setting the key of the setting to store
     * @param {*} value the value to store for the setting
     */
    async setSetting(setting, value) {
        //since only string can be stored in the asyncstorage, we have to use JSON.stringify
        await AsyncStorage.setItem(setting, JSON.stringify(value))
    }

    /**
     * gets the setting from the persistence
     * @param {*} setting the key of the setting to get
     */
    async getSetting(setting) {
        let value = await AsyncStorage.getItem(setting)
        return JSON.parse(value)
    }

    /**
     * gets all available settings from the persistence
     */
    async getAllSettings() {
        let settingNames = await AsyncStorage.getAllKeys()
        let settings = {}
        for(let index in settingNames) {
            let setting = settingNames[index]
            settings[setting] = await this.getSetting(setting)
        }
        return settings
    }
}

export default settings = new SettingsPersistence();