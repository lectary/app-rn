import {Lesson} from '../dto/Lesson';
import {Word} from '../dto/Word';
import sqlite from 'react-native-sqlite-storage'
import constants from '../util/Constants'
import {replacePatterns, replaceForSort} from '../util/ReplacementService'

/**
 * class used to handle the persistence of lessons and vocabulary
 */
class LessonPersistence {

    constructor() {
        /*
        enabling promise runtime to get the db object without callback, right now
        there is no way to use it to get the information from the db
        */
        sqlite.enablePromise(true)
    }

    /**
     * gets the database and initializes it if it did not happen yet
     * @returns the object to access the db
     */
    async getDatabase() {
        if (!this.db) {
            this.db = await sqlite.openDatabase({name: constants.database.filename, key: 'lectary'})
            await this.db.transaction(transaction => {
                    transaction.executeSql(constants.database.createLessonTableQuery,
                        [],
                        (transaction, result) => {
                            //console.log('successfully created lessons table')
                        },
                        (transaction, error) => {
                            //console.log('error creating lessons table:')
                            //console.log(error)
                        }
                    )
                }
            )
            await this.db.transaction(transaction => {
                    transaction.executeSql(constants.database.createWordTableQuery,
                        [],
                        (transaction, result) => {
                            //console.log('successfully created words table')
                        },
                        (transaction, error) => {
                            //console.log('error creating words table:')
                            //console.log(error)
                        }
                    )
                }
            )
        }
        return this.db
    }


    /**
     * deletes a lesson from the persistence, deletes the words first and then the lesson
     * @param {*} lesson the lesson to store
     * @param {*} callback the callback to the service layer
     */
    async deleteLesson(lesson, callback) {
        let db = await this.getDatabase()
        db.transaction(transaction => {
                transaction.executeSql(constants.database.deleteWordsQuery,
                    [lesson.id],
                    (transaction, results) => {
                        transaction.executeSql(
                            constants.database.deleteLessonQuery,
                            [lesson.id],
                            (transaction, results) => {
                                if (callback) {
                                    callback(true)
                                }
                            },
                            (transaction, error) => {
                                //console.log(error)
                                if (callback) {
                                    callback(false)
                                }
                            }
                        )
                    },
                    (transaction, error) => {
                        //console.log(error)
                        if (callback) {
                            callback(false)
                        }
                    }
                )
            }
        )
    }


    /**
     * inserts a lesson into the persistence
     * @param {*} lesson the lesson to insert
     * @param {*} callback the callback to the service layer
     */
    async insertLesson(lesson, callback) {
        let db = this.db
        db.transaction(transaction => {
                transaction.executeSql(constants.database.insertIntoLessonQuery,
                    [lesson.name,
                        lesson.readableName,
                        lesson.sortableName,
                        lesson.date ? lesson.date.toString() : null,
                        lesson.lang,
                        lesson.pack,
                        lesson.sort,
                    ],
                    (transaction, results) => {
                        if (results.insertId) {
                            lesson.id = results.insertId
                            lesson.oldDate = lesson.date
                        }

                        if (callback) {
                            callback(lesson)
                        }

                        return lesson
                    },
                    (transaction, error) => {
                        //console.log('error inserting lesson:')
                        //console.log(error)
                    }
                )
            }
        )
    }

    /**
     * stores a word in the persistence
     * @param {*} word the word to insert
     * @param {*} callback the callback to call in case it is the last word
     */
    async insertWord(word, callback) {
        let db = await
            this.getDatabase()
        let id = await
            db.transaction(transaction => {
                    transaction.executeSql(constants.database.insertIntoWordQuery,
                        [word.name,
                            word.readableName,
                            word.sortableName,
                            word.lesson.id,
                            word.sort,
                            word.lang,
                            word.date ? word.date.toString() : undefined,
                            word.pack,
                        ],
                        (transaction, results) => {
                            if (results.insertId) {
                                word.id = results.insertId
                            }
                            //only call the callback on the last word
                            if (callback) {
                                callback(true)
                            }
                            return word
                        },
                        (transaction, error) => {
                            //console.log('error inserting word:')
                            //console.log(error)
                        }
                    )
                }
            )
    }

    /**
     * reads all lessons which readableName contains the currentFilter if set
     * @param {*} currentFilter the filter to apply if set
     * @param {*} callback the callback to call with the received data
     */
    async findAllLessons(currentFilter, callback) {
        let db = await
            this.getDatabase()
        let query = constants.database.getAllLessonsQuery
        let args = []
        if (currentFilter && currentFilter.length > 0) {
            query = constants.database.getAllLessonsFilteredQuery
            args.unshift(`%${currentFilter}%`)
        }
        db.readTransaction(transaction => {
                transaction.executeSql(query,
                    args,
                    (transaction, results) => {
                        var allLessons = []
                        for (let i = 0; i < results.rows.length; ++i) {
                            let item = results.rows.item(i)
                            let l = new Lesson()
                            l.name = item.name;
                            l.readableName = item.readableName;
                            l.sortableName = item.sortableName;
                            l.id = item.id;
                            l.sort = item.sort
                            l.date = new Date(item.date)
                            l.lang = item.lang
                            l.pack = item.pack
                            allLessons.push(l)
                        }
                        if (callback) {
                            callback(allLessons)
                        }
                        return allLessons
                    },
                    (transaction, error) => {
                        //console.log('error when loading all lessons: ')
                        //console.log(error)
                    }
                )
            }
        )
    }

    /**
     * reads all data for one lesson if set and containing the filter if set
     * @param {*} lesson if set, only words of the given lesson are returned
     * @param {*} filter if set, only words containing the filter in their readableName are returned
     * @param {*} callback the callback to return the data to
     */
    async findAllWords(lesson, filter, callback) {
        let db = await
            this.getDatabase()
        let query
        let args = []
        if (lesson && (lesson.id >= 0)) {
            if (filter && filter.length > 0) {
                query = constants.database.getAllWordsFilteredQuery
                args.unshift('%' + filter + '%')
            } else {
                query = constants.database.getAllWordsByLessonQuery
                args.unshift(lesson.id)
            }
        } else if (filter && filter.length > 0) {
            query = constants.database.getAllWordsFilteredQuery
            args.unshift('%' + filter + '%')
        } else {
            query = constants.database.getAllWordsQuery
        }
        db.readTransaction(transaction => {
                transaction.executeSql(query,
                    args,
                    (transaction, results) => {
                        let allWords = []
                        for (let i = 0; i < results.rows.length; ++i) {
                            let item = results.rows.item(i)
                            let l = new Lesson()
                            l.name = item.lessonName
                            l.readableName = item.lessonReadableName
                            l.sortableName = item.lessonSortableName
                            l.id = item.lessonId
                            let word = new Word()
                            word.name = item.name
                            word.lesson = l
                            word.readableName = item.readableName
                            word.sortableName = item.sortableName
                            word.id = item.id
                            word.sort = item.sort
                            word.lang = item.lang
                            word.date = new Date(item.date)
                            allWords.push(word)
                        }
                        //disabled for now as it is neither necessary and will kill performance
                        // for (let i = 0; i < allLessons.length; i++) {
                        //     this.getPackagesOfWord(allLessons[i], (i === (allLessons.length - 1)) && (() => callback(allLessons)))
                        // }
                        if (callback) {
                            callback(allWords)
                        }
                        return allWords
                    },
                    (transaction, error) => {
                        //console.log('error when loading words from lesson')
                        //console.log(error)
                    }
                )
            }
        )

    }

    /**
     * checks if a lesson with the given name is available in the persistence
     * @param {*} lesson the lesson to check if exists
     * @param {*} callback the callback to return the result to
     */
    async checkIfLessonExists(lesson, callback) {
        let db = await
            this.getDatabase()
        let query = constants.database.checkIfLessonExistsQuery
        let args = [lesson.readableName, lesson.pack]
        db.readTransaction(
            transaction => {
                transaction.executeSql(
                    query,
                    args,
                    (transaction, results) => {
                        let id
                        let date
                        if (results.rows.length > 0) {
                            id = results.rows.item(0).id
                            date = new Date(results.rows.item(0).date)
                        }
                        if (callback) {
                            callback(id, date)
                        }
                        return id
                    },
                    (transaction, error) => {
                        //console.log('error when checking for existence of lesson')
                        //console.log(error)
                    }
                )
            }
        )

    }

    async deleteAllLessons(callback) {
        let db = await this.getDatabase()


        db.transaction(transaction => {
                transaction.executeSql(
                    constants.database.deleteAllWordsQuery,
                    [],
                    (transaction, results) => {
                        db.transaction(transaction => {
                                transaction.executeSql(constants.database.deleteAllLessonsQuery,
                                    [],
                                    (transaction, results) => {
                                        if (callback) {
                                            callback(true)
                                        }
                                    },
                                    (transaction, error) => {
                                        //console.log(error)
                                        if (callback) {
                                            callback(false)
                                        }
                                    }
                                )
                            }
                        )
                    }
                    ,
                    (transaction, error) => {
                        //console.log(error)

                        callback && callback(false)

                    }
                )
            }
        )
    }
}

export default lessonPersistence = new LessonPersistence()