//electron setup
const { app, BrowserWindow, ipcMain, Menu, Tray } = require( 'electron' );
const path = require( 'node:path' );

const AutoLaunch = require( 'auto-launch' );
let autoLauncher = new AutoLaunch( {
    name: 'KeyJam Control',
} );

let appWindow;

const loudness = require( 'loudness' );

const serial = require( "./serial" );
const config = require( "./config" );

let profiles = [];
let buttonMap = [];
let comList = [];
let connected = false;

const createWindow = () => {
    appWindow = new BrowserWindow( {
        width: 1000, height: 800, webPreferences: {
            preload: path.join( __dirname, 'preload.js' )
        },
        icon: path.join( __dirname, 'icon.ico' )
    } );

    appWindow.loadFile( './ui/index.html' );
}
app.whenReady().then( () => {
    let tray = new Tray( path.join( __dirname, 'icon.ico' ) );
    tray.setToolTip( 'KeyJam Control' );
    tray.setContextMenu( Menu.buildFromTemplate( [
        { label: 'Options', click: createWindow },
        { label: 'Quit', click: () => app.quit() },
    ] ) );

    if ( app.isPackaged ) {
        autoLauncher.enable();
    } else {
        autoLauncher.disable();
    }

    serial.scan( scanList );

    ipcMain.handle( 'getOpenStatus', async event => {
        if(connected){
        event.sender.send( 'connected', {
                map: buttonMap,
                profile: await serial.invoke( "list -c y -p base" ),
                port: connected
            } );
        }
        return {
            list: comList,
            connected
        }
    } );

    ipcMain.on( 'connect', async ( event, comPort ) => {
        connectToKeyJam( comPort );
        config.defaultComPort = comPort;
    } );

    ipcMain.on( 'disconnect', ( event ) => {
        serial.disconnect();
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

app.on( 'window-all-closed', () => {
    //don't quit
} )

function scanList( list ) {
    comList = list;
    if ( list.map( v => v.path ).includes( config.defaultComPort ) ) {
        if(!connected) {
            connectToKeyJam( config.defaultComPort );
        }
    } else if ( appWindow ) {
        appWindow.webContents.send( 'comList', list );
    }
}

function connectToKeyJam( comPort ) {
    console.log( `Connecting to board on ${comPort}` );
    serial.connect( comPort )
        .then( () => serial.invoke( "list -p map" ) )
        .then( map => {
            buttonMap = map;
            serial.on( 'press', handlePress );
            serial.scan( scanList );
            serial.onClose( () => {
                console.log( `Disconnected from ${connected}` )
                connected = null;
                if ( appWindow ) {
                    appWindow.webContents.send( 'disconnected' );
                }
            } );
        } )
        .then( async () => {
            connected = comPort;
            if ( appWindow ) {
                appWindow.webContents.send( 'connected', {
                    map: buttonMap,
                    profile: await serial.invoke( "list -c y -p base" ),
                    port: connected
                } );
            }
        } )
        .catch( e => {
            console.error( `Failed to connect on ${comPort}`, e );
        } );
}

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