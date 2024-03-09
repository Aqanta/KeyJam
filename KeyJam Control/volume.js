const loudness = require( 'loudness' )
const serial = require( "./serial" );

let previousVolume = null;
let currentVolume;

serial.connect( `COM4` )
    .then( () => serial.on( async ( msg ) => {
        currentVolume = Number( msg );
    } ) );


setInterval( async () => {
    if ( currentVolume !== previousVolume && currentVolume ) {
        console.log( "setting volume to:", currentVolume );
        previousVolume = currentVolume
        await loudness.setVolume( currentVolume );
    } else if ( currentVolume !== previousVolume && currentVolume === 0 ) {
        console.log( "setting volume to:", currentVolume );
        previousVolume = currentVolume
        await loudness.setVolume( 1 );
    }
}, 100 );

