import RNFS from 'react-native-fs'

export default constants = {
    lectaryAllFilesPath: '<insert-path-to-files-here>',
    lectaryUrl: 'https://<insert-url-here>',
    appName: 'Lectary',
    allOption: 'Alle Vokabel',
    deleteAllOption: 'Alle Lektionen löschen',
    lectaryWebPage: 'https://lectary.net',
    lectaryEmail: 'info@lectary.net',
    basePath: RNFS.DocumentDirectoryPath,
    tempPath: RNFS.TemporaryDirectoryPath,
    files: {
      extension: '.mp4'
    },
    navigation: {
      keys: {
          vocabularyViewStack: 'VocabularyView',
          downloadScreen: 'DownloadView',
          aboutScreen: 'AboutView',
          settingsScreen: 'SettingsView',
          videoScreen: 'VideoView',
          wordListScreen: 'ListView',
          settingsAboutView: 'SettingsAboutView'
      },
      titles: {
          downloadScreen: 'Lektionen verwalten',
          aboutScreen: 'Über',
          settingsScreen: 'Einstellungen',
          videoScreen: 'Video',
          wordListScreen: 'Alle Vokabel',
      }
    },
    database: {
        pageSize: 100,
        filename: 'lectary.db',
        createLessonTableQuery: 'CREATE TABLE IF NOT EXISTS lesson ( ' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name VARCHAR(100) NOT NULL, ' +
        'readableName VARCHAR(100) NOT NULL, ' +
        'sortableName VARCHAR(100) NOT NULL, ' +
        'sort INTEGER, ' +
        'date DATE, ' +
        'lang VARCHAR(50), ' +
        'pack VARCHAR(100) ' +
        ');',
        createWordTableQuery: 'CREATE TABLE IF NOT EXISTS word ( ' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
        'name VARCHAR(100) NOT NULL, ' +
        'readableName VARCHAR(100) NOT NULL, ' +
        'sortableName VARCHAR(100) NOT NULL, ' +
        'sort INTEGER, ' +
        'date DATE, ' +
        'lang VARCHAR(50), ' +
        'pack VARCHAR(100), ' +
        'lessonId INTEGER NOT NULL,' +
        'FOREIGN KEY(lessonId) REFERENCES lesson(id)' +
        ');',
        insertIntoLessonQuery: 'INSERT INTO lesson(name, readableName, sortableName, date, lang, pack, sort) VALUES (' +
        '?,?,?,?,?,?,?' +
        ');',
        insertIntoWordQuery: 'INSERT INTO word(name, readableName, sortableName, lessonId, sort, lang, date, pack) VALUES (' +
        '?,?,?,?,?,?,?,?' +
        ');',
        getAllLessonIdsQuery: 'SELECT id FROM lesson ORDER BY sortableName;',
        getAllLessonsQuery: 'SELECT * FROM lesson l ORDER BY sortableName ;',
        getAllLessonsFilteredQuery: 'SELECT * FROM lesson WHERE readableName LIKE ? ORDER BY sortableName ;',
        getAllWordIdsQuery: 'SELECT id FROM word ORDER BY sortableName;',
        getAllWordIdsByLessonQuery: 'SELECT id FROM word WHERE lessonId = ? ORDER BY sortableName;',
        getAllWordIdsFilteredQuery: 'SELECT id FROM word WHERE readableName LIKE ? ORDER BY sortableName;',
        getAllWordIdsByLessonFilteredQuery: 'SELECT id FROM word WHERE lessonId = ? AND readableName LIKE ? ORDER BY sortableName;',
        getAllWordsQuery: 'SELECT w.id, w.name, w.readableName, w.sortableName, w.lessonId, w.date, w.sort, w.lang, l.name as lessonName, l.readableName as lessonReadableName, l.sortableName as lessonSortableName ' +
        'FROM word w JOIN lesson l ON (w.lessonId = l.id) ' +
        //'GROUP BY w.name ' +
        'ORDER BY w.sortableName ',
        getAllWordsFilteredQuery: 'SELECT w.id, w.name, w.readableName, w.sortableName, w.date, w.lessonId,w.sort, w.lang, l.name as lessonName, l.readableName as lessonReadableName, l.sortableName as lessonSortableName ' +
        'FROM word w JOIN lesson l ON (w.lessonId = l.id) ' +
        'WHERE w.readableName LIKE ? ' +
        //'GROUP BY w.name ' +
        'ORDER BY w.sortableName ',
        getAllWordsByLessonQuery: 'SELECT w.id, w.name, w.readableName, w.sortableName, w.date, w.lessonId,w.sort, w.lang, l.name as lessonName, l.readableName as lessonReadableName, l.sortableName as lessonSortableName ' +
        'FROM word w JOIN lesson l ON (w.lessonId = l.id) ' +
        'WHERE w.lessonId = ? ' +
        //'GROUP BY w.name ' +
        'ORDER BY w.sort IS NULL, w.sort, w.sortableName ',
        getAllWordsByLessonFilteredQuery: 'SELECT w.id, w.name, w.readableName, w.date, w.sortableName,w.sort, w.lang, w.lessonId, l.name as lessonName, l.readableName as lessonReadableName, l.sortableName as lessonSortableName ' +
        'FROM word w JOIN lesson l ON (w.lessonId = l.id) ' +
        'WHERE w.lessonId = ? AND w.readableName LIKE ? ' +
        //'GROUP BY w.name ' +
        'ORDER BY w.sort IS NULL, w.sort, w.sortableName ',
        getWordByIdQuery: 'SELECT w.id, w.name, w.readableName, w.date, w.sortableName,w.sort, w.lang, w.lessonId, l.name as lessonName, l.readableName as lessonReadableName, l.sortableName as lessonSortableName ' +
        'FROM word w JOIN lesson l ON (w.lessonId = l.id) WHERE w.id = ? ' +
        'ORDER BY w.sortableName ',
        checkIfLessonExistsQuery: 'SELECT id,date FROM lesson WHERE readableName = ? AND pack = ?',
        deleteWordsQuery: 'DELETE FROM word WHERE lessonId = ?;',
        deleteLessonQuery: 'DELETE FROM lesson WHERE id = ?;',
        deleteAllWordsQuery: 'DELETE FROM word',
        deleteAllLessonsQuery: 'DELETE FROM lesson',

    },
    settings: {
        defaults: {
            capitalized: false,
            autoplay: false,
            repeat: false,
            extendedControls: false,
            muted: true,
            showSeekbar: true,
            overlay: true,
            reverseLearningDirection: false,
        },
        keys: {
            capitalized: 'capitalized',
            autoplay: 'autoplay',
            repeat: 'repeat',
            extendedControls: 'extendedControls',
            muted: 'muted',
            showSeekbar: 'showSeekbar',
            overlay: 'overlay',
            reverseLearningDirection: 'reverseLearningDirection',
        },

    },
    metaInformation: {
        keys: {
            sort: 'SORT',
            date: 'DATE',
            pack: 'PACK',
            lang: 'LANG'
        }
    },
    colors: {
        yellow: '#FFDA5D',
        white: '#F8F8F8',
        grey: '#7A7A7A',
        red: '#E95876',
        green: '#97E975',
        lightblue: '#5AC1CF',
        shadedblue: '#005462',
        darkblue: '#053751',
        black: '#000000',
        transparent: 'transparent',
        orange: '#f48e5b', 
        violett: '#b65dff',
    },
}