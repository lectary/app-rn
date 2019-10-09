import RNFS from 'react-native-fs'
import {Word} from '../dto/Word'
import {Lesson} from '../dto/Lesson'
import {unzip} from 'react-native-zip-archive'
import lessonPersistence from '../persistence/LessonPersistence'
import constants from '../util/Constants'
import {
    replacePatterns,
    replaceZip,
    replaceForSort,
    createWordFromFilename,
    createLessonFromFilename
} from '../util/ReplacementService'

/**
 * class responsible to handle everything regarding lessons
 */
class LectureService {

    /**
     * @returns all lessons, that can be downloaded from lectary.net and check whether they already exist in the persistence
     */
    async findAllOnlineLessons(callback) {
        this.findAllAvailableLessons('', async (lessons) => {
            if(lessons) {
                try {
                    let response = await fetch(`${constants.lectaryUrl}/${constants.lectaryAllFilesPath}`).then(res => res.text())
                    let jsonResponse = JSON.parse(response)
                    let allLessons = []

                    jsonResponse.forEach((value) => {
                            let lesson = createLessonFromFilename(value)
                            let existingLesson = lessons.find(l => l.readableName === lesson.readableName && ((!l.pack && !lesson.pack) || l.pack === lesson.pack))
                            if(existingLesson) {
                                lesson.id = existingLesson.id
                                lesson.oldDate = existingLesson.date
                                lessons.splice(lessons.indexOf(existingLesson), 1)
                            }
                            allLessons.push(lesson)
                        }
                    )
                    //add lessons that might have been deleted from the server
                    lessons.forEach((lesson) => {
                        lesson.oldDate = lesson.date
                        lesson.notOnServer = true
                        allLessons.push(lesson)
                    })
                    //console.log('remaining lessons: ')
                    //console.log(lessons)
                    //console.log(allLessons)
                    callback && callback(this._sortArray(allLessons))

                } catch(error) {
                    //console.log(error)
                    callback && callback(undefined)
                }
            } else {
                //console.log('could not load lessons from persistence')
                callback && callback(undefined)
            }

        })
    }

    /**
     * lists all words, that exist in the folder of the given lesson
     * @param {*} lesson the lesson to list the words of
     */
    async _listWordsInFolder(lesson) {
        let result = await this._listFolderContent(`${lesson.getPath()}`)
        let allWords = []
        result.forEach((value) => {
                //skip empty names and names starting with ., e.g. the .DS_STORE file
                if (value.name && value.name.length > 0 && (!value.name.startsWith('.')) && value.name.endsWith(constants.files.extension)) {
                    allWords.push(createWordFromFilename(value.name, lesson))
                }
            }
        )
        return allWords
    }

    /**
     * lists the name of everything contained in a folder
     * @param {*} folder the folder to read the content of
     */
    async _listFolderContent(folder) {
        let result = await RNFS.readDir(folder)
        return result
    }

    /**
     * sorts the list by their sortable name
     * @param {*} words the lsit to sort
     */
    _sortArray(words) {
        return words.sort((a, b) => a.sortableName.localeCompare(b.sortableName))
    }

    /**
     * checks wheter a lesson exists
     *
     * @param {*} lesson the lesson to check existence of
     * @param {*} callback the callback that sould be called with the result
     */
    async checkIfLessonExists(lesson, callback) {
        lessonPersistence.checkIfLessonExists(lesson, callback)
    }

    /**
     * finds all words, if set from one lesson and if set containing the filter in the readable name
     * @param {*} lesson if set, only words of the given lesson are returned
     * @param {*} filter if set, only words, which readable name contains the filter are returned
     * @param {*} callback the callback to return the result to
     */
    async findAllWords(lesson, filter, callback) {
        lessonPersistence.findAllWords(lesson, filter, callback)
    }

    /**
     * returns all downloaded lessons, if set only those containing the filter in their readable name
     * @param {*} currentFilter if set, only lessons containing the filter in their readable name are returned
     * @param {*} callback the callback to return the data to
     */
    async findAllAvailableLessons(currentFilter, callback) {
        lessonPersistence.findAllLessons(currentFilter, callback)
    }

    /**
     * stores the words of a given lesson in the persistence
     * @param {*} lesson the lesson to store the words of
     * @param {*} callback the callback to call after all words are inserted
     */
    async _storeWordsInLesson(lesson, callback) {
        let words = []
        try {
            words = await this._listWordsInFolder(lesson)
        } catch(error) {
            //console.log('error listing words in lesson')
            //console.log(error)
            if(callback) {
                callback(false)
                return
            }
        }
        for (let i = 0; i < words.length; i++) {
            lessonPersistence.insertWord(words[i], i === words.length-1 ? (success) => {
                if(success) {
                    callback(lesson)
                } else {
                    callback(success)
                }
            } : undefined
            )
        }
    }

    /**
     * deletes a lesson and all words from the persistence and the storage
     * @param {*} lesson the lesson to delete
     * @param {*} callback the callback to call when everything is deleted
     */
    async deleteLesson(lesson, callback) {
        lessonPersistence.deleteLesson(lesson, (success) => {
            this._deleteLessonFromStorage(lesson, success, callback)
        })
    }

    /**
     * deletes a lesson from storage if it was successfully deleted from the persistence
     * @param {*} lesson the lesson to delete from storage
     * @param {*} success if the lesson was successfully deleted from the persistence
     * @param {*} callback the callback to call when the deletion process is finished
     */
    async _deleteLessonFromStorage(lesson, success, callback) {
        if (success) {
            try {
                await this._deleteFromStorage(lesson.getPath())
                callback && callback(true)
            } catch (error) {
                //console.log(error)
                callback && callback(false)
            }
        } else {
            callback(false)
        }
    }

    /**
     * deletes a file or folder from the storage
     * @param {*} path the path to the file to delete
     */
    async _deleteFromStorage(path) {
        await RNFS.exists(path)
            .then((result) => {
                if (result) {
                    return RNFS.unlink(path)
                        .then(() => {
                            //console.log(`file ${path} deleted`);
                        })
                        // `unlink` will throw an error, if the item to unlink does not exist
                        .catch((err) => {
                            //console.log(err.message);
                        });
                }
            })
    }

    /**
     * downloads the lesson from lectary.net and stores it in the persistence
     * @param {*} lessonToDownload the lesson to download
     * @param {*} callback the callback to call after successfully donwloading and persisting the lesson
     */
    async downloadLesson(lessonToDownload, callback) {
        let toFile = `${constants.tempPath}/${lessonToDownload.name}`
        let file = await RNFS.downloadFile(
            {
                fromUrl: `${constants.lectaryUrl}/${lessonToDownload.downloadFileName}`,
                toFile: toFile
            })
        await file.promise;
        //console.log('downloaded')
        let result
        try {
            result = await this._unzipFile(lessonToDownload)
        } catch(error) {
            //console.log(error)
            callback(undefined, `Die Lektion ist fehlerhaft. Bitte melden Sie den Fehler bei  ${constants.lectaryEmail} .`)
        }
        //delete the downloaded .zip archive
        this._deleteFromStorage(toFile)
        let exists = await RNFS.exists(lessonToDownload.getPath())
        if(exists) {
            let words = await this._listWordsInFolder(lessonToDownload)
            if(words.length < 1) {
                callback(undefined, `Die Lektion enthält keine Vokabel.`)
            } else {
                await lessonPersistence.insertLesson(
                    lessonToDownload,(lesson) => {
                        if(lesson) {
                            this._storeWordsInLesson(lesson, callback)
                        } else {
                            callback(undefined)
                        }
                    }
                )
            }
        } else {
            callback(undefined, `Die Lektion ist fehlerhaft. Bitte melden Sie den Fehler bei  ${constants.lectaryEmail} .`)
        }

        return result
    }

    /**
     * unzips a given file to the default path
     * @param {*} lesson the lesson to unzip the folder of
     */
    _unzipFile(lesson) {
        let sourcePath = `${constants.tempPath}/${lesson.name}`
        let targetPath = `${constants.basePath}`
        let path = unzip(sourcePath, targetPath)
        return path
    }

    /**
     * deletes all lessons from the storage and persistence
     */
    async deleteAllLessons(callback) {
        //console.log('deleting all lessons')
        lessonPersistence.deleteAllLessons((success) => {
            this._deleteAllLessonsFromStorage(success, callback)
        })
    }

    async _deleteAllLessonsFromStorage(success, callback) {
        
        //console.log('deleting all lessons from storage')
        if (success) {
            try {
                let allLessonsInStorage = await this._listFolderContent(constants.basePath)
        
                for(let i = 0; i < allLessonsInStorage.length; i++) {
                    let lesson = allLessonsInStorage[i]
                    
                    await this._deleteFromStorage(`${lesson.path}`)
                }

                callback && callback(true)

            } catch (error) {
                //console.log(error)

                callback && callback(false)

            }
        } else {

            callback && callback(false)

        }

    }


}

let deleteAllOption = new Lesson();
let allOption = new Lesson();

export const getDeleteAllOption = () => {
    if(!deleteAllOption.name) {
        deleteAllOption.name = constants.deleteAllOption;
        deleteAllOption.readableName = constants.deleteAllOption;
        deleteAllOption.sortableName = constants.deleteAllOption;
        deleteAllOption.id = -1;
    }
    return deleteAllOption
}

export const getAllLessonsOption = () => {
    if(!allOption.name) {
        allOption.name = constants.allOption;
        allOption.readableName = constants.allOption;
        allOption.sortableName = constants.allOption;
        allOption.id = -1;
    }
    return allOption;
}

export default lessonService = new LectureService()