# Lectary

Lectary is an opensource app to help learning sign language. For more information check the [Lectary website](https://lectary.net/).

## React-Native

A tutorial for installing react native can be found on the [official site](https://facebook.github.io/react-native/)

npm is required to install and run react native and its dependencies. To install the react-native client use the command:
`npm install -g react-native-cli`

After that you can initialize your project:
`react-native init <project-name>`

## Videos on the webserver

The app can download videos over the Internet from a dedicated server. The videos of a lesson are in in a standard zip-file (not PK-zip). The location of the zip-files are defined in  `Constants.js`. In the following example the zip-files (which hold the videos) are stored on a server `https://example.com/videos/LESSON__1.zip` and `https://example.com/videos/LESSON__2.zip`. An overview of all zip-files available is stored at `https://example.com/videos/overview.json`

Thus, `Constants.js` must be defined as follows:
```
...
lectaryUrl: 'https://example.com/videos',
lectaryAllFilesPath: 'overview.json',
...
```

The answer from `https://example.com/videos/overview.json` could be

```
[
{
  "fileName": "LESSON__1.zip",
  "vocableCount": 2,
  "fileSize": 5
},
{
  "fileName": "LESSON__2.zip",
  "vocableCount": 3,
  "fileSize": 6
}
]
```

The .zip folders of the video lessons have to be downloadable from the same main path with the file name as path. Inside the 
.zip another folder has to exist with the exact name as the zip that contains the .mp4 files.

Example for content of `https://example.com/videos/LESSON__1.zip`:
```
| LESSON__1
+- video1.mp4
+- video2.mp4
```

Example for content of `https://example.com/videos/LESSON__2.zip`:
```
| LESSON__2
+- Video1__from__Lesson__2.mp4
+- Video2__from__Lesson__2.mp4
+- Video3__from__Lesson__2.mp4
```


## Compile and run the app 

To build the app for Android the Android SDK is required. To build the app for iOS XCode is required. 



To start the app run:

`react-native run-android` 

or

`react-native run-ios`

inside the project folder.

Run 
`react-native bundle --dev true --assets-dest ./ios --entry-file ./index.js --platform ios --bundle-output ios/main.jsbundle`
to create a local bundle for the ios app, such that i can use this one in case the dev server is not available.

In my case the app was not able to connect to running server on my phone, so i had to run the following commands before:

`mkdir android\app\src\main\assets` (inside the project folder)

`react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`

`react-native run-android`

(solution found on [StackOverflow](https://stackoverflow.com/questions/44446523/unable-to-load-script-from-assets-index-android-bundle-on-windows))

After the app has been deployed on the device it can be reloaded using the node development server that is started via:

`react-native start --reset-cache`

To fix the hot reload feature, i had to first get into the dev settings of the app (by shaking the phone to open the 
context menu and selecting `dev settings`), and the set the `Debug server host&port for device` to my PCs ip and port. 
Then the device no longer has to be connected via usb to enable hot reloading. 

## Installation of new libraries

First the standard npm call to add a new library has to be made:

`npm install --save <lib-name> `

Then to automatically link the new library in android and ios correctly simply call:

`react-native link <lib-name>`

This has automatically configured everything until now without any conflicts.

In some cases the libraries define specific changes that have to be made in `MainActivity.java` and possibly in a file 
for iOS too. Always check those files after installing a new library if the required changes have been made by the `link` 
command, if not you have to make those changes manually

## Code walkthrough

The source code for android can be found under `/android`, the source code for ios can be found under `/ios`. In most cases
there is nothing that has to be done with these files. The react code can be found under `/src`. The following structure has been used:

* `/app`: Contains all UI components. These are structured into the different main views `About`, `Download`, `Navigation`, `Settings`
and `Videoview`. In addition the `Util` ´package contains components that might be easily reused in other components.
* `/dto`: Defines the different objects that are used for data transfer in between components and service layers. A `word` is a single word
in sign language. Mainly represents a single video. A `lessons` is a collection of words that has been provided by the backend.
* `/persistence`: Handles the storage of the data on the device. SQLite is used to store information about the videos and the location
on the device. The video themselves are stored in the storage of device. For the settings the default key value store is used.
* `/resources`: Contains resources like the logo and the used icons.
* `/services`: Intermediate layer used to keep the logic. Communicates with the persistence layer to store the data after downloading it.
* `/styles`: Contains the main `style.js` file that contains the overall reused styles. Custom styles are defined in the components directly.
* `/util`: Utility package used for the constants and the logic of parsing the names of the files into readable names.

## Colors
The following colors are the only ones used. They are defined in the constants.js file as well.

`#FFDA5D yellow`

`#F8F8F8 white`

`#E95876 red`

`#97E975 green`

`#5AC1CF lightblue`

`#053751 darkblue`

## Future ideas
* Multi language support
* Filtering by language and regional standards
* More lessons
