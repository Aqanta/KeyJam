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
    invoke
}

let onNextJson;

function onMessage( msg ) {
    if ( onNextJson && msg[0] === "{" ) {
        onNextJson( JSON.parse( msg ) );
        onNextJson = "";
    }
    console.log( "From serial:\t", msg );
}


function scan( callback ) {
    scanInterval = setInterval( async () => {
        const ports = await SerialPort.list();
        if ( ports.length > 1 ) {
            callback( ports );
        }
    }, 2500 );
}

function stopScan() {
    clearInterval( scanInterval );
    scanInterval = null;
}

function connect( path, callback ) {
    stopScan();
    port = new SerialPort( { path: path, baudRate: 14400, autoOpen: false, } );
    port.on( 'open', function () {
        connected = true;
        callback();
    } );
    port.open( function ( err ) {
        if ( err ) {
            console.error( 'Error opening port: ', err.message )
            return false;
        }
    } )
    parser = port.pipe( new ReadlineParser( { delimiter: '\r\n' } ) );
    parser.on( 'data', onMessage );
}

function send( msg ) {
    //TODO check to see if initialized

    try {
        port.write( msg );
        port.write( '\r\n' );
        console.log( msg );
    } catch ( e ) {
        console.error( "error sending serial port data", e );
        return false;
    }
    return true;
}

function invoke( msg ) {
    return new Promise( ( resolve, reject ) => {
        if ( msg === "list -c y -p base" ) {
            send( msg );
            onNextJson = list => {
                resolve( list );
            };
        }
    } );
}