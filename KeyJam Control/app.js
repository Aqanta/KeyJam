//electron setup
const { app, BrowserWindow, ipcMain } = require( 'electron' );
const path = require( 'node:path' );

let appWindow;

const loudness = require( 'loudness' );

const serial = require( "./serial" );
const config = require( "./config" );

let profiles = [];
let buttonMap = [];

const comPort = 8;

const createWindow = () => {
    appWindow = new BrowserWindow( {
        width: 1000, height: 800, webPreferences: {
            preload: path.join( __dirname, 'preload.js' )
        }
    } );

    appWindow.loadFile( './ui/index.html' );
}
app.whenReady().then( () => {
    createWindow();

    serial.scan( ( list ) => {
        console.log( list );
        if ( list.map( v => v.path ).includes( `COM${comPort}` ) ) {
            console.log( `Connecting to board on COM${comPort}` );
            serial.connect( `COM${comPort}` )
                .then( () => serial.invoke( "list -p map" ) )
                .then( map => buttonMap = map )
                .then( () => serial.on( 'press', handlePress ) );
        }
    } );

    ipcMain.handle( 'changeInput', async ( event, { input, mapping } ) => {
        return serial.send( `update -i ${input} -j ${JSON.stringify( mapping )}` ) ? 200 : "error";
    } );

    ipcMain.handle( 'loadProfile', async ( event, { type, name } ) => {
        console.log();
        console.log( await serial.invoke( "list -c y -p base" ) );
        console.log();
        /* return {
             map: {
                 "buttons": [ {
                     "name": "BTN_1", "x": 1, "y": 0, "input": 15
                 }, {
                     "name": "BTN_2", "x": 2, "y": 0, "input": 2,
                 }, {
                     "name": "BTN_3", "x": 3, "y": 0, "input": 6
                 }, {
                     "name": "BTN_4", "x": 0, "y": 1, "input": 14
                 }, {
                     "name": "BTN_5", "x": 1, "y": 1, "input": 4
                 }, {
                     "name": "BTN_6", "x": 2, "y": 1, "input": 5
                 }, {
                     "name": "BTN_7", "x": 3, "y": 1, "input": 0
                 }, {
                     "name": "BTN_8", "x": 0, "y": 2, "input": 8
                 }, {
                     "name": "BTN_9", "x": 1, "y": 2, "input": 3
                 }, {
                     "name": "BTN_10", "x": 2, "y": 2, "input": 1
                 }, {
                     "name": "BTN_11", "x": 3, "y": 2, "input": 7
                 } ],

                 "encoders": [ {
                     "name": "Dial", "x": 0, "y": 0, "buttonInput": 13, "s1": 12, "s2": 11
                 } ]
             },
             profile: {
                 inputs: [
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     },
                     {
                         "macro": false,
                         "keys": [],
                         "hold": false,
                         "consumerKey": false
                     }
                 ]
             }
         }*/
        console.log( !!buttonMap );
        return {
            map: buttonMap,
            profile: await serial.invoke( "list -c y -p base" )
        }
    } );

    ipcMain.handle( 'addMacro', async ( event, macro ) => {
        return await config.addMacro( macro );
    } );

    ipcMain.handle( 'removeMacro', async ( event, macro ) => {
        return await config.removeMacro( macro );
    } );

    ipcMain.handle( 'listMacros', async ( event ) => {
        return config.listMacro();
    } );

    ipcMain.handle( 'setMacro', async ( event, { inputNumber, macroID } ) => {
        console.log( "Setting macros" );
        await config.setMacro( inputNumber, macroID );
        return true;
    } );

    ipcMain.handle( 'getMacroByInput', ( event, macroID ) => {
        return config.getMacroByInput( macroID );
    } );
} );

const axios = require( 'axios' );

async function handlePress( msg ) {
    if ( msg.includes( "-k" ) ) {
        let macro = config.getMacroByInput( msg.match( /-k (\d)/ )[1] );
        try {
            switch ( macro.type ) {
                case "GET":
                    axios.get( macro.text );
                    break;
            }
        } catch ( e ) {
            console.error( e );
        }
    } else if ( msg.includes( "-s" ) ) {
        currentVolume = 100 - Number( msg.match( /-s (\d+)/ )[1] );
    }
}

let previousVolume = null;
let currentVolume;

setInterval( async () => {
    if ( currentVolume !== previousVolume && currentVolume ) {
        //console.log( "setting volume to:", currentVolume );
        previousVolume = currentVolume
        await loudness.setVolume( currentVolume );
    } else if ( currentVolume !== previousVolume && currentVolume === 0 ) {
        //console.log( "setting volume to:", currentVolume );
        previousVolume = currentVolume
        await loudness.setVolume( 1 );
    }
}, 200 );