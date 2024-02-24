const { SerialPort } = require( 'serialport' );
const { ReadlineParser } = require( '@serialport/parser-readline' );
let port, parser
let initialized = false;

module.exports = {
    initialize: () => {
        try {
            port = new SerialPort( { path: 'COM8', baudRate: 14400 } );
            port.pipe( new ReadlineParser( { delimiter: '\r\n' } ) );
            initialized = true;
        } catch ( e ) {
            console.error( 'error connecting over serial port', e );
        }
        return initialized
    },
    //TODO add a listener for key presses
    send,
    invoke
}

function send( msg ) {
    //TODO check to see if initialized

    try {
        //port.write( msg );
        //port.write('\r\n');
        console.log( msg );
    } catch ( e ) {
        console.error( "error sending serial port data", e );
        return false;
    }
    return true;
}

function invoke(msg, callback){

}