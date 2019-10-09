/**
 * dto for words of a lesson / / data transfer object
 */
import {Lesson} from "./Lesson";

export class Word {

    id : number;
    name : string;
    readableName : string;
    sortableName : string;
    lesson : Lesson;
    lang : string;
    pack : string;
    sort : number;
    date : Date;

    constructor() {

    }
    /**
     * the path the file of the word should be stored at
     */
    getPath() {
        return `${this.lesson.getPath()}/${this.name}`
    }
}