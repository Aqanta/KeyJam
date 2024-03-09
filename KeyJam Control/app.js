//electron setup
const { app, BrowserWindow, ipcMain } = require( 'electron' );
const path = require( 'node:path' );

let appWindow;

const serial = require( "./serial" );
let profiles = [];
let buttonMap = [];

const comPort = 3;

const createWindow = () => {
    appWindow = new BrowserWindow( {
        width: 1000,
        height: 800,
        webPreferences: {
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
                .then( map => buttonMap = map );
        }
    } );

    ipcMain.handle( 'changeInput', async ( event, { input, mapping } ) => {
        return serial.send( `update -i ${input} -j ${JSON.stringify( mapping )}` ) ? 200 : "error";
    } );

    ipcMain.handle( 'loadProfile', async ( event, { type, name } ) => {
        console.log( "button map: ", buttonMap );
        return {
            map: buttonMap,
            profile: await serial.invoke( "list -c y -p base" )
        }
    } );
} );