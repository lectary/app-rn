import constants from '../util/Constants'

/**
 * dto for lessons / data transfer object
 */
export class Lesson {

    id : number;
    name : string;
    readableName : string;
    sortableName : string;
    date : Date;
    oldDate : Date;
    downloadFileName : string;
    oldLesson : Lesson;
    isSearch : boolean;
    lang : string;
    pack : string;
    sort : number;
    notOnServer: boolean;

    constructor() {

    }

    /**
     * returns the path the lesson should be stored
     */
    getPath() {
        return `${constants.basePath}/${this.name}`
    }

}