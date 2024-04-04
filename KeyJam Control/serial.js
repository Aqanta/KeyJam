const { SerialPort } = require( 'serialport' );
const { ReadlineParser } = require( '@serialport/parser-readline' );
let port, parser
let connected = false;
let scanInterval;

module.exports = {
    //TODO add a listener for key presses
    scan,
    connect,
    stopScan,
    send,
    invoke,
    on,
    onClose: setOnClose,
    disconnect
}

let onNextJson;
let onMsg = {};
let onClose;

function onMessage( msg ) {
    if ( onNextJson && ( msg[0] === "{" || msg[0] === "[" ) ) {
        onNextJson( JSON.parse( msg ) );
        onNextJson = "";
    } else if ( Object.keys( onMsg ).includes( msg.match( /^\w*/ )[0] ) ) {
        onMsg[msg.match( /^\w*/ )[0]]( msg );
    } else {
        console.log( "Unknown command from serial:\t", msg );
    }
}

function on( command, callback ) {
    onMsg[command] = callback;
}

function setOnClose( callback ) {
    onClose = callback
}


function scan( callback ) {
    scanInterval = setInterval( async () => {
        callback( await SerialPort.list() );
    }, 2000 );
}

function stopScan() {
    clearInterval( scanInterval );
    scanInterval = null;
}

function connect( path ) {
    return new Promise( ( resolve ) => {
        stopScan();
        port = new SerialPort( { path: path, baudRate: 14400, autoOpen: false, } );
        port.on( 'open', function () {
            connected = true;
            resolve();
        } );
        port.open( function ( err ) {
            if ( err ) {
                console.error( 'Error opening port: ', err.message );
                return false;
            }
        } )
        parser = port.pipe( new ReadlineParser( { delimiter: '\r\n' } ) );
        parser.on( 'data', onMessage );
        port.on( 'close', () => {
            port = null;
            parser = null;
            if ( typeof onClose === "function" ) {
                onClose();
            }
        } )
    } )
}

function send( msg ) {
    //TODO check to see if initialized

    try {
        //console.log( "sending: ", msg );
        port.write( msg );
        port.write( '\r\n' );
    } catch ( e ) {
        console.error( "error sending serial port data", e );
        return false;
    }
    return true;
}

function invoke( msg ) {
    return new Promise( ( resolve ) => {
        send( msg );
        onNextJson = list => {
            resolve( list );
        };
    } );
}

function disconnect(){
    port.close();
}