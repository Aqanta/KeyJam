const { contextBridge, ipcRenderer } = require( "electron" );

// Expose protected methods from node modules
contextBridge.exposeInMainWorld( "electron", {
    send: ( channel, data ) => {
        // whitelist channels
        let validChannels = [];
        if ( validChannels.includes( channel ) ) {
            ipcRenderer.send( channel, data );
        }
    },
    on: ( channel, func ) => {
        //white
        let validChannels = [];
        if ( validChannels.includes( channel ) ) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on( channel, ( event, ...args ) => func( ...args ) );
        }
    },
    // From render to main and back again.
    invoke: ( channel, args ) => {
        let validChannels = ['changeInput', 'loadProfile', 'addMacro', 'listMacros', 'setMacro', 'removeMacro', 'getMacroByInput'];
        if ( validChannels.includes( channel ) ) {
            return ipcRenderer.invoke( channel, args );
        }
    }
} )