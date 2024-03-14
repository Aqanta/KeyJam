//global variables
let currentlyEditingButton = null;
let currentProfileDate;
let map;

async function loadProfile( type, name ) {
    let data = await electron.invoke( 'loadProfile', { type, name } );
    console.log(data);
    currentProfileDate = data.profile;
    map = data.map;
    loadButtons();
}

function loadButtons() {
    let html = "<div class='m-1 is-relative'>"
    map.buttons.forEach( button => {
        html += createButtonDisplay( button, currentProfileDate.inputs[button.input] );
    } );
    map.encoders.forEach( encoder => {
        html += createRotaryDisplay( encoder );
    } );
    html += "</div>";
    document.getElementById( 'buttonHolder' ).innerHTML = html;
}

const size = 8;

function createButtonDisplay( button, mapping ) {
    return `
    <div 
        class="box m-2 p-1" 
        style="text-align: center; position: absolute;
            width: ${ size }rem; height: ${ size }rem;
            top: ${ button.y * ( size + 1 ) }rem; left: ${ button.x * ( size + 1 ) }rem;" 
        onclick="openEditButtonModal(${ button.input })">
        <div class="pt-3">${ button.name }</div>
        ${ mapping.keys ? mapping.keys.map( key => {
        return `<span class="tag ${ getKeyTagClass( getKeyType( key ) ) }">
${ getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase() }
</span>`
    } ).join( " " ) : "" } 
        ${ mapping.consumerKey ? `<span class='tag is-danger'>${ getConsumerKeyFromCode( mapping.consumerKey ) }</span>` : '' }
        ${ mapping.macro ? "<span class='tag is-link'>macro</span>" : '' }
    </div>
`;
}

function createRotaryDisplay( encoder ) {
    console.log( encoder );
    return `
    <div 
        class="box m-2 p-1" 
        style="text-align: center; position: absolute;
            width: ${ size }rem; height: ${ size }rem;
            top: ${ encoder.y * ( size + 1 ) }rem; left: ${ encoder.x * ( size + 1 ) }rem;
            border-radius: ${ size }rem"
        >
        <div class="pt-3">${ encoder.name }</div>
        <div class="is-flex is-flex-wrap-wrap buttons are-small" >
            <div style="width: 50%"><button class="button" onclick="openEditButtonModal(${ encoder.s2 })">CCW</button></div>
            <div style="width: 50%"><button class="button" onclick="openEditButtonModal(${ encoder.s1 })">CW</button></div>
            <div style="width: 100%" class="has-text-centered"><button class="button" onclick="openEditButtonModal(${ encoder.buttonInput })">Click</button></div>
        </div>
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

async function loadEditButtonModal() {
    document.getElementById( "editButtonModalTitleNumber" ).innerHTML = currentlyEditingButton.number;
    if ( currentlyEditingButton.buttonMap.keys?.length === undefined ) {
        currentlyEditingButton.buttonMap.keys = [];
    }
    document.getElementById( "editButtonModalKeys" ).innerHTML = currentlyEditingButton.buttonMap.keys.map( key => {
        return `
<span class="tag is-large ${ getKeyTagClass( getKeyType( key ) ) }" style="cursor: pointer" onclick="editButtonDeleteKey('${ key }')">
${ getKeyFromCode( key )[0] === "F" ? getKeyFromCode( key ) : getKeyFromCode( key ).toLowerCase() }
</span>`;
    } ).join( " " );
    console.log( currentlyEditingButton.buttonMap.consumerKey );
    document.getElementById( "editButtonConsumerSelect" ).value = getConsumerKeyFromCode( currentlyEditingButton.buttonMap.consumerKey ) ?? "none"
    document.getElementById( "editButtonMacro" ).checked = !!currentlyEditingButton.buttonMap.macro;

    //load Macros into dropdown
    let selected =  await electron.invoke( 'getMacroByInput', currentlyEditingButton.number );
    let macros = await electron.invoke( 'listMacros' );
    let html = `<option ${!selected ? "selected" : ""} value="none">None</option>`;
    macros.forEach( m => html += `<option value="${m.id}" ${m.id === selected ? "selected" : ""}>${m.name}</option>`);
    document.getElementById('editButtonMacroSelect').innerHTML = html;
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

    const usingMacro = !!document.getElementById( "editButtonMacro" ).checked;
    let selectedMacroID = document.getElementById("editButtonMacroSelect").value;
    currentlyEditingButton.buttonMap.macro = usingMacro;
    if(!usingMacro || selectedMacroID === "none"){
        selectedMacroID = undefined;
    }
    await electron.invoke( 'setMacro', {
        inputNumber: currentlyEditingButton.number,
        macroID: selectedMacroID
    } );

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

 function openMacroEditor(){
    openModal( "editMacros" );
    loadMacroEditor();
}

async function loadMacroEditor(){
    let macros = await electron.invoke( 'listMacros' );

    //list macros
    let html = "";
    macros.forEach( m => html += `<li>${m.name}<span class="pl-6" onclick="removeMacro('${m.id}')">X</span></li>`);
    document.getElementById('macroList').innerHTML = html;
}

async function addMacro(){
    let macro = {
        name: document.getElementById("newMacroName").value,
        type:document.getElementById("newMacroType").value,
        text: document.getElementById("newMacroText").value
    }
    await electron.invoke( 'addMacro', macro );
    await loadMacroEditor();
}

async function removeMacro(id){
    await electron.invoke( 'removeMacro', id );
    await loadMacroEditor();
}