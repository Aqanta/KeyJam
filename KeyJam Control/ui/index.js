//global variables
let currentlyEditingButton = null;
let currentProfileDate;

async function loadProfile( type, name ) {
    currentProfileDate = await electron.invoke( 'loadProfile', { type, name } );
    loadButtons();
}

function loadButtons() {
    let html = "<div class='is-flex is-flex-wrap-wrap'>"
    currentProfileDate.buttons.forEach( ( b, i ) => {
        html += createButtonDisplay( b, i );
    } );
    html += "</div>";
    document.getElementById( 'buttonHolder' ).innerHTML = html;
}

function createButtonDisplay( b, i ) {
    return `
    <div class="box m-2 p-1" style="width: 7rem; height: 7rem;text-align: center;" onclick="openEditButtonModal(${i})">
        <div class="pt-3">${i}</div>
        ${b.keys ? b.keys.map( key => {
        return `<span class="tag ${getKeyTagClass( getKeyType( key ) )}">
${getKeyFromCode( key ) ? getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase() : key}
</span>`
    } ).join( " " ) : ""} 
        ${b.macro ? "<span class='tag is-link'>macro</span>" : ''}
    </div>
`;
}

function openEditButtonModal( buttonNumber ) {
    openModal( "editButton" );
    currentlyEditingButton = {
        "number": buttonNumber,
        buttonMap: structuredClone( currentProfileDate.buttons[buttonNumber] )
    };
    loadEditButtonModal();
}

function loadEditButtonModal() {
    document.getElementById( "editButtonModalTitleNumber" ).innerHTML = currentlyEditingButton.number;
    if ( currentlyEditingButton.buttonMap.keys?.length === undefined ) {
        currentlyEditingButton.buttonMap.keys = [];
    }
    document.getElementById( "editButtonModalKeys" ).innerHTML = currentlyEditingButton.buttonMap.keys.map( key => {
        return `
<span class="tag is-large ${getKeyTagClass( getKeyType( key ) )}" style="cursor: pointer" onclick="editButtonDeleteKey('${key}')">
${getKeyFromCode( key ) ? getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase() : key}
</span>`;
    } ).join( " " );
    document.getElementById( "editButtonMacro" ).checked = !!currentlyEditingButton.buttonMap.macro;
}

function editButtonAddKey() {
    let newKey = document.getElementById( "editButtonSelect" ).value;
    if ( newKey.length > 1 ) {
        newKey = structuredClone( keyCodes[newKey] );
    }
    console.log( newKey );
    if ( newKey && !currentlyEditingButton.buttonMap.keys.includes( newKey ) ) {
        currentlyEditingButton.buttonMap.keys.push( newKey );
    }
    loadEditButtonModal();
}

function editButtonDeleteKey( key ) {
    let index = currentlyEditingButton.buttonMap.keys.indexOf( key );
    if ( index === -1 ) {
        index = currentlyEditingButton.buttonMap.keys.indexOf( Number( key ) );
    }
    console.log( index, currentlyEditingButton.buttonMap.keys, key );
    if ( index > -1 ) {
        currentlyEditingButton.buttonMap.keys.splice( index, 1 );
    }
    loadEditButtonModal();
}

async function editButtonSave() {
    currentlyEditingButton.buttonMap.hold = currentlyEditingButton.buttonMap.keys?.length === 1;
    currentlyEditingButton.buttonMap.macro = !!document.getElementById( "editButtonMacro" ).checked;
    let res = await electron.invoke( 'changeKey', {
        "number": currentlyEditingButton.number,
        "map": currentlyEditingButton.buttonMap,
    } );
    if ( res !== 200 ) {
        console.error( 'error saving key', res );
    } else {
        currentProfileDate.buttons[currentlyEditingButton.number] = structuredClone( currentlyEditingButton.buttonMap );
        loadButtons();
        closeModal( "editButton" );
    }
}