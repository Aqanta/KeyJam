//electron setup
const { app, BrowserWindow, ipcMain } = require( 'electron' );
const path = require( 'node:path' );

const serial = require( "./serial" );
let profiles = [];

const createWindow = () => {
    const win = new BrowserWindow( {
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join( __dirname, 'preload.js' )
        }
    } );

    win.loadFile( './ui/index.html' );
}
app.whenReady().then( () => {
    createWindow();
    if ( serial.initialize() ) {
        serial.invoke( 'list', ( p ) => {
            profiles = p;
            //TODO let the render know we have the profiles
        } )
    } else {
        //TODO handle non-loaded serial
    }

    ipcMain.handle( 'changeKey', async ( event, {input, key} ) => {
        return serial.send( `update -i ${ input } -k ${ key }` ) ? 200 : "error";
    } )
} )