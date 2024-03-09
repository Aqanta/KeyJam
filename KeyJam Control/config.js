const fs = require( 'fs' );
const { v4: uuidv4 } = require( 'uuid' );

module.exports = {
    addMacro,
    getMacro,
    listMacro,
    removeMacro
}

let config = {
    macros: []
}
readConfig().then( () => {
    //config is read in
} );

async function readConfig() {
    return new Promise( ( resolve, reject ) => {
        try {
            fs.access( "config.json", fs.constants.F_OK, ( err ) => {
                if ( err ) {
                    updateConfig();
                }
                fs.readFile( "config.json", 'utf8', ( err, data ) => {
                    if ( err ) {
                        throw err;
                    }
                    config = JSON.parse( data );
                } );
            } );
        } catch ( err ) {
            reject( err );
        }
    } );
}

async function updateConfig() {
    return new Promise( ( resolve, reject ) => {
        try {
            fs.writeFile( "config.json", JSON.stringify( config, undefined, 2 ), 'utf8', () => {
                resolve();
            } );
        } catch ( err ) {
            reject( err );
        }
    } )
}

async function addMacro( macro ) {
    if ( !macro.name ) {
        throw "macro must have a name";
    }
    const id = uuidv4();
    macro.id = id;
    config.macros.push( macro );
    await updateConfig();
    return id;
}

function getMacro( id ) {
    return config.macros.find( m => m.id === id );
}

function listMacro() {
    return config.macros.map( m => {
        return {
            id: m.id,
            name: m.name
        }
    } )
}

async function removeMacro( id ) {
    let index = config.macros.findIndex( m => m.id === id );
    if ( index > -1 ) {
        config.splice( index, 1 );
        await updateConfig();
        return true;
    } else {
        return false;
    }
}