import {Word} from '../dto/Word'
import {Lesson} from '../dto/Lesson'
import constants from './Constants'

export function replacePatterns(text) {
    if (text) {
// 2019-02-24: NEU
//
// App-Filename
        text = text.replace(/.zip/g, "")
        text = text.replace(/.mp4/g, "")
//
// german special characters
        text = text.replace(/_OE/g, "Ö")
        text = text.replace(/_Oe/g, "Ö")
        text = text.replace(/_UE/g, "Ü")
        text = text.replace(/_Ue/g, "Ü")
        text = text.replace(/_AE/g, "Ä")
        text = text.replace(/_Ae/g, "Ä")
        text = text.replace(/_oe/g, "ö")
        text = text.replace(/_ue/g, "ü")
        text = text.replace(/_ae/g, "ä")
        text = text.replace(/_ss/g, "ß")
        text = text.replace(/_SS/g, "ß") // legacy
//
// german keyboard layout - first row (with <shift>)
        text = text.replace(/_GG/g, "°")
        text = text.replace(/_RR/g, "!")
        text = text.replace(/_HK/g, '"')
        text = text.replace(/_PARA/g, '§')
        text = text.replace(/_DOLLAR/g, '$')
        text = text.replace(/_PERCENT/g, '%')
        text = text.replace(/_AMP/g, '&')
        text = text.replace(/_VS/g, "/")
        text = text.replace(/_KK/g, "(")
        text = text.replace(/_ZZ/g, ")")
        text = text.replace(/_EQUAL/g, '=')
        text = text.replace(/_FF/g, "?")
        text = text.replace(/_GRAC/g, "`")  // Grave Accent
// --- german keyboard layout - first row (with <alt gr>)
        text = text.replace(/_CFLX/g, "^") // Circumflex
        text = text.replace(/_CBO/g, "{") // curly brackets open
        text = text.replace(/_SBO/g, "[") // square brackets open
        text = text.replace(/_SBC/g, "]") // square brackets close
        text = text.replace(/_CBC/g, "}") // curly brackets close
        text = text.replace(/_RS/g, "\\")
        text = text.replace(/_ACAC/g, "`")  // Acute Accent
// --- special characters (german layout - second row)
        text = text.replace(/_ATSY/g, "@") // at symbol
        text = text.replace(/_EURO/g, "€")
        text = text.replace(/_STAR/g, "*")
        text = text.replace(/_PLUS/g, "+")
        text = text.replace(/_TILDE/g, "~")
// --- special characters (german layout - third row)
        text = text.replace(/_AP/g, "'") // not an APOSTROPHE - single quotation mark
        text = text.replace(/_HASH/g, "#") // number sign
// --- special characters (german layout - fourth row)
        text = text.replace(/_LESSER/g, "<")
        text = text.replace(/_GREATER/g, ">")
        text = text.replace(/_VERTBAR/g, "|") // vertical bar
        text = text.replace(/_SP/g, ";")
        text = text.replace(/_COMMA/g, ",")
        text = text.replace(/_DP/g, ":")
        text = text.replace(/_PP/g, ".")
        text = text.replace(/_UU/g, "_")
        text = text.replace(/_-/g, "-")
        text = text.replace(/__/g, " ")
//
// words
        text = text.replace(/_MARKE/g, " (Marke)")
        text = text.replace(/_LADEN/g, " (Geschäft)")
        text = text.replace(/_VAR1/g, " (Variante 1)")
        text = text.replace(/_VAR2/g, " (Variante 2)")
        text = text.replace(/_VAR3/g, " (Variante 3)")
//
// legacy special characters
        text = text.replace(/_ATa/g, "ã")
        text = text.replace(/_AZe/g, "ê")
        text = text.replace(/_AAi/g, "í")
        text = text.replace(/_AAe/g, "é")
        text = text.replace(/_AAi/g, "í")
//
// not 100 percent sure about this
        text = text.replace(/_/g, "") // mmhhhhh.

        text = text.trim()
    }

    return text
}

export function replaceForSort(text) {
    text = replacePatterns(text)
    text = text.replace(/ü/g, 'uzzzz')
    text = text.replace(/Ü/g, 'uzzzz')
    text = text.replace(/Ä/g, 'azzzz')
    text = text.replace(/ä/g, 'azzzz')
    text = text.replace(/ö/g, 'ozzzz')
    text = text.replace(/Ö/g, 'ozzzz')
    text = text.replace(/St./g, 'Sanktzzzz')
    text = text.toLowerCase()
    return text
}

export function replaceZip(text) {
    text = text.replace(/.zip/g, "")
    return text
}

export function replaceMP4(text) {
    text = text.replace(/.mp4/g, "")
    return text
}

export function createWordFromFilename(text, lesson) {
    let splitText = text.split(/---/g)
    let readableName = replacePatterns(splitText[0])
    let sortableName = replaceForSort(splitText[0])
    let word = new Word()
    word.name = text
    word.lesson = lesson
    word.readableName = readableName
    word.sortableName = sortableName
    word.id = -1
    for (let i = 1; i < splitText.length; i++) {
        retrieveMetaInformation(word, splitText[i])
    }
    return word
}

export function createLessonFromFilename(value) {
    let text = value.fileName
    let name = replaceZip(text)
    let splitText = name.split(/---/g)
    let readableName = replacePatterns(splitText[0])
    let sortableName = replaceForSort(splitText[0])
    let lesson = new Lesson()
    lesson.name = name
    lesson.readableName = readableName
    lesson.sortableName = sortableName
    lesson.id = -1
    lesson.downloadFileName = value.fileName
    lesson.fileSize = value.fileSize
    lesson.vocableCount = value.vocableCount

    for (let i = 1; i < splitText.length; i++) {
        retrieveMetaInformation(lesson, splitText[i])
    }
    return lesson
}

function retrieveMetaInformation(object, text) {
    text = replaceMP4(text)
    text = replaceZip(text)
    let keyValue = text.split(/--/g)
    let key = keyValue[0]
    let value = keyValue[1]
    switch (key) {
        case constants.metaInformation.keys.sort:
            object.sort = Number(value)
            break
        case constants.metaInformation.keys.lang:
            object.lang = replacePatterns(value)
            break
        case constants.metaInformation.keys.pack:
            object.pack = replacePatterns(value)
            break
        case constants.metaInformation.keys.date:
            object.date = new Date(value)
            break
        default:
            //console.log(`Unknown key: ${key} with value: ${value}`)
    }
}