async function changeKey( input, key ) {
    let res = await electron.invoke( 'changeKey', { input, key } );
    if ( res !== 200 ) {
        console.error( 'error saving key' );
    }
}