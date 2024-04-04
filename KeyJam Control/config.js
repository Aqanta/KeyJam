const fs = require( 'fs' );
const { v4: uuidv4 } = require( 'uuid' );
const path = require( 'node:path' );

module.exports = {
    addMacro,
    getMacro,
    listMacro,
    removeMacro,
    setMacro,
    getMacroByInput,
    get defaultComPort() {
        return config.defaultComPort;
    },
    set defaultComPort( port ) {
        config.defaultComPort = port;
        updateConfig();
    }
}

let config = {
    macros: [],
    setMacros: {}
}
readConfig().then( () => {
    //config is read in
} );

async function readConfig() {
    return new Promise( ( resolve, reject ) => {
        try {
            fs.access( path.join( __dirname, 'config.json' ), fs.constants.F_OK, ( err ) => {
                if ( err ) {
                    updateConfig();
                }
                fs.readFile( path.join( __dirname, 'config.json' ), 'utf8', ( err, data ) => {
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
            fs.writeFile( path.join( __dirname, 'config.json' ), JSON.stringify( config, undefined, 2 ), 'utf8', () => {
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
        config.macros.splice( index, 1 );
        Object.keys( config.setMacros ).forEach( k => {
            if ( config.setMacros[k] === id ) {
                config.setMacros[k] = undefined;
            }
        } );
        await updateConfig();
        return true;
    } else {
        return false;
    }
}

async function setMacro( inputNumber, id ) {
    config.setMacros[`input-${ inputNumber }`] = id;
    await updateConfig();
    return true;
}

function getMacroByInput( inputNumber ) {
    return getMacro( config.setMacros[`input-${ inputNumber }`] );
}