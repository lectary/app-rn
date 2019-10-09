import {StyleSheet, Dimensions} from 'react-native';
import constants from "../util/Constants";

export default styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    darkBackground: {
        backgroundColor: constants.colors.darkblue,
    },
    lightBackground: {
        backgroundColor: constants.colors.white,
    },
    header: {
        flex: 1,
        padding: 5,
        backgroundColor: constants.colors.white,
    },
    headerBurgerIcon: {
        flex: 0,
        marginHorizontal: 10,
        fontSize: 30,
        color: constants.colors.lightblue,
        backgroundColor: 'transparent',
    },
    headerIconWrapper: {
        flex: 0,
        justifyContent: 'center',
        alignContent: 'center',
        color: constants.colors.lightblue,
        backgroundColor: constants.colors.transparent,
    },
    headerIcon: {
        flex: 0,
        justifyContent: 'center',
        marginHorizontal: 10,
        fontSize: 25,
        color: constants.colors.lightblue,
        backgroundColor: constants.colors.transparent,
    },
    heading: {
        textAlign: "left",
        fontSize: 20,
        color: constants.colors.black,
    },
    activityIndicator: {
        flex: 1,
    },
    containerSearchBox: {
        flex: 1,
        backgroundColor: constants.colors.white,
        color: constants.colors.white,
    },
    searchbox: {
        padding: 0,
        bottom: 0,
        fontSize: 18,
        borderBottomWidth: 0,
        backgroundColor: constants.colors.white,
    },
    searchboxClearIcon: {
        padding: 10,
        fontSize: 25,
        backgroundColor: constants.colors.transparent
    },
    searchboxSearchIcon: {
        top:15,
        left: 2,
        fontSize: 25,
    },
    listItemContainer: {
        alignContent: 'center',
        backgroundColor: constants.colors.darkblue,
        borderColor: constants.colors.white,
    },
    listItem: {
        padding: 10,
        paddingVertical: 12,
        fontSize: 18,
        color: constants.colors.white,
        backgroundColor: constants.colors.darkblue,
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    containerLesson: {
        backgroundColor: constants.colors.white,
    },
    iconButton: {
        flex: 0,
        fontSize: 22,
        paddingRight:10,
        color: constants.colors.lightblue,
        backgroundColor: constants.colors.transparent,
        alignContent:'center',
        alignSelf:'center',
    },
    iconButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        margin: 0,
        marginVertical: 0,
        flex: 0,
        padding: 0,
        //fontSize: 18,
        width: '100%',
        //color: constants.colors.black,
        backgroundColor: constants.colors.white,
        alignSelf: 'center',
        alignContent: 'center'
    },
    iconButtonContainerLesson: {
        backgroundColor: constants.colors.white,
    },
    containerLessonMargin: {
        marginHorizontal: 5,
    },
    iconContainer: {
        flex: 0,
        alignContent: 'center',
        justifyContent: 'center',
    },
    iconMinWidth: {
        width:44,
    },
    iconListItem: {
        flex: 2,
        // padding: 10,
        paddingVertical: 12,
        margin: 0,
        fontSize: 18,
        color: constants.colors.black,
        backgroundColor: constants.colors.transparent,
    },
    iconListItemLessons: {
        flex: 1,
        paddingHorizontal: 0,
        color: constants.colors.black,
        backgroundColor: constants.colors.transparent,
    },
    touchableHighlightIconWrapper: {
        width:'100%',
        flexDirection: 'row',
        display: 'flex',
    },
    listItemSeparator: {
        height:1,
        flex:0,
        backgroundColor: constants.colors.white,
    },
    listItemSeparatorBlack: {
        backgroundColor: constants.colors.grey,
        opacity: 0.5,
    },
    itemSparatorVertical: {
        height:'100%',
        width:1,
    },
    dialogContentText: {
        color: constants.colors.black,
        paddingTop: 10,
        //justifyContent: 'center',

        fontSize: 18,
    },
    dialogContentTitle: {
        paddingTop: 10,
        color: constants.colors.black,
        fontWeight: 'bold',
        fontSize: 18,
    },
    dialogButtonText: {
        color: constants.colors.lightblue,
        fontSize: 18,
    }
});