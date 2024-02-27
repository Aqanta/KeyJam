//electron setup
const { app, BrowserWindow, ipcMain } = require( 'electron' );
const path = require( 'node:path' );

let appWindow;

const serial = require( "./serial" );
let profiles = [];

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
        if ( list.map( v => v.path ).includes( 'COM8' ) ) {
            console.log( "Connecting to board on COM8" );
            serial.connect( 'COM8', () => {
                serial.send( "list" );
            } );
        }
    } );

    ipcMain.handle( 'changeKey', async ( event, { number, map } ) => {
        return serial.send( `update -b ${ number } -j ${ JSON.stringify( map ) }` ) ? 200 : "error";
    } );

    ipcMain.handle( 'loadProfile', async ( event, { type, name } ) => {
        return await serial.invoke( "list -c y -p base" );
    } );
} );