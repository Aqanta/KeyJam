//global variables
let currentlyEditingButton = null;
let currentProfileDate;
let map;

async function loadProfile( type, name ) {
    let data = await electron.invoke( 'loadProfile', { type, name } );
    currentProfileDate = data.profile;
    map = data.map;
    console.log(currentProfileDate, map);
    loadButtons();
}

function loadButtons() {
    let html = "<div class='m-1 is-relative'>"
    map.buttons.forEach( button => {
        console.log(currentProfileDate.inputs[button.input], button.input);
        html += createButtonDisplay( button, currentProfileDate.inputs[button.input] );
    });
    html += "</div>";
    document.getElementById( 'buttonHolder' ).innerHTML = html;
}

function createButtonDisplay( button, mapping ) {
    const size = 8;
    return `
    <div 
        class="box m-2 p-1" 
        style="text-align: center; position: absolute;
            width: ${size}rem; height: ${size}rem;
            top: ${button.y * (size + 1)}rem; left: ${button.x * (size + 1) }rem;" 
        onclick="openEditButtonModal(${button.input})">
        <div class="pt-3">${button.name}</div>
        ${mapping.keys ? mapping.keys.map( key => {
        return `<span class="tag ${getKeyTagClass( getKeyType( key ) )}">
${getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase()}
</span>`
    } ).join( " " ) : ""} 
        ${mapping.consumerKey ? `<span class='tag is-danger'>${getConsumerKeyFromCode(mapping.consumerKey)}</span>` : ''}
        ${mapping.macro ? "<span class='tag is-link'>macro</span>" : ''}
    </div>
`;
}

function openEditButtonModal( buttonNumber ) {
    openModal( "editButton" );
    currentlyEditingButton = {
        "number": buttonNumber,
        buttonMap: structuredClone( currentProfileDate.inputs[buttonNumber] )
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
${getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase()}
</span>`;
    } ).join( " " );
    console.log(currentlyEditingButton.buttonMap.consumerKey);
    document.getElementById( "editButtonConsumerSelect" ).value = getConsumerKeyFromCode(currentlyEditingButton.buttonMap.consumerKey) ?? "none"
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
    let consumerKey = document.getElementById( "editButtonConsumerSelect" ).value;
    if ( consumerKey !== "none" ) {
        currentlyEditingButton.buttonMap.consumerKey = consumerKeyCodes[consumerKey];
    } else {
        currentlyEditingButton.buttonMap.consumerKey = false;
    }
    let res = await electron.invoke( 'changeInput', {
        "input": currentlyEditingButton.number,
        "mapping": currentlyEditingButton.buttonMap,
    } );
    if ( res !== 200 ) {
        console.error( 'error saving key', res );
    } else {
        currentProfileDate.inputs[currentlyEditingButton.number] = structuredClone( currentlyEditingButton.buttonMap );
        loadButtons();
        closeModal( "editButton" );
    }
}