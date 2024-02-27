const keyType = {
    "shift": "modifier",
    "alt": "modifier",
    "control": "modifier",
    "super": "modifier",
    "f1": "non-printing",
    "capsLock": "control"
}

function getKeyType( key ) {
    if ( typeof key === "string" ) {
        return "printing";
    }
    if ( key >= 0x80 && key <= 0x87 ) {
        return "modifier";
    }
    if ( [0x0030, 0x0031, 0x0032, 0x006F, 0x0070, 0x000C, 0x00C6, 0x00C7, 0x00C8, 0xC1, 0xCF, 0xDB].includes( key ) ) {
        return "control"
    }
    return "non-printing";
}

const keyCodes = {
    //modifiers
    LEFT_CTRL: 0x80,
    LEFT_SHIFT: 0x81,
    LEFT_ALT: 0x82,
    LEFT_SUPER: 0x83,
    RIGHT_CTRL: 0x84,
    RIGHT_SHIFT: 0x85,
    RIGHT_ALT: 0x86,
    RIGHT_SUPER: 0x87,

    // Misc keys
    UP_ARROW: 0xDA,
    DOWN_ARROW: 0xD9,
    LEFT_ARROW: 0xD8,
    RIGHT_ARROW: 0xD7,
    BACKSPACE: 0xB2,
    TAB: 0xB3,
    RETURN: 0xB0,
    MENU: 0xED, // "Keyboard Application" in USB standard
    ESC: 0xB1,
    INSERT: 0xD1,
    DELETE: 0xD4,
    PAGE_UP: 0xD3,
    PAGE_DOWN: 0xD6,
    HOME: 0xD2,
    END: 0xD5,
    CAPS_LOCK: 0xC1,
    PRINT_SCREEN: 0xCE, // Print Screen / SysRq
    SCROLL_LOCK: 0xCF,
    PAUSE: 0xD0, // Pause / Break

    // Numeric keypad
    NUM_LOCK: 0xDB,
    KP_SLASH: 0xDC,
    KP_ASTERISK: 0xDD,
    KP_MINUS: 0xDE,
    KP_PLUS: 0xDF,
    KP_ENTER: 0xE0,
    KP_ENTER: 0xE0,
    KP_1: 0xE1,
    KP_2: 0xE2,
    KP_3: 0xE3,
    KP_4: 0xE4,
    KP_5: 0xE5,
    KP_6: 0xE6,
    KP_7: 0xE7,
    KP_8: 0xE8,
    KP_9: 0xE9,
    KP_0: 0xEA,
    KP_DOT: 0xEB,
// Function keys
    F1: 0xC2,
    F2: 0xC3,
    F3: 0xC4,
    F4: 0xC5,
    F5: 0xC6,
    F6: 0xC7,
    F7: 0xC8,
    F8: 0xC9,
    F9: 0xCA,
    F10: 0xCB,
    F11: 0xCC,
    F12: 0xCD,
    F13: 0xF0,
    F14: 0xF1,
    F15: 0xF2,
    F16: 0xF3,
    F17: 0xF4,
    F18: 0xF5,
    F19: 0xF6,
    F20: 0xF7,
    F21: 0xF8,
    F22: 0xF9,
    F23: 0xFA,
    F24: 0xFB,
}

let consumerKeyCodes = {
    // Power Control
    POWER: 0x0030,
    RESET: 0x0031,
    SLEEP: 0x0032,
// Screen Brightness
    BRIGHTNESS_INCREMENT: 0x006F,
    BRIGHTNESS_DECREMENT: 0x0070,
// These HID usages operate only on mobile systems (battery powered) and
// require Windows 8 (build 8302 or greater).
    WIRELESS_RADIO_CONTROLS: 0x000C,
    WIRELESS_RADIO_BUTTONS: 0x00C6,
    WIRELESS_RADIO_LED: 0x00C7,
    WIRELESS_RADIO_SLIDER_SWITCH: 0x00C8,
// Media Control
    PLAY_PAUSE: 0x00CD,
    SCAN_NEXT: 0x00B5,
    SCAN_PREVIOUS: 0x00B6,
    STOP: 0x00B7,
    VOLUME: 0x00E0,
    MUTE: 0x00E2,
    BASS: 0x00E3,
    TREBLE: 0x00E4,
    BASS_BOOST: 0x00E5,
    VOLUME_INCREMENT: 0x00E9,
    VOLUME_DECREMENT: 0x00EA,
    BASS_INCREMENT: 0x0152,
    BASS_DECREMENT: 0x0153,
    TREBLE_INCREMENT: 0x0154,
    TREBLE_DECREMENT: 0x0155,
// Application Launcher
    AL_CONSUMER_CONTROL_CONFIGURATION: 0x0183,
    AL_EMAIL_READER: 0x018A,
    AL_CALCULATOR: 0x0192,
    AL_LOCAL_BROWSER: 0x0194,
// Browser/Explorer Specific
    AC_SEARCH: 0x0221,
    AC_HOME: 0x0223,
    AC_BACK: 0x0224,
    AC_FORWARD: 0x0225,
    AC_STOP: 0x0226,
    AC_REFRESH: 0x0227,
    AC_BOOKMARKS: 0x022A,
// Mouse Horizontal scroll
    AC_PAN: 0x0238,
};

function getKeyFromCode( code ) {
    if ( typeof code === "string" ) {
        return code;
    }
    return Object.keys( keyCodes ).filter( k => keyCodes[k] === code )[0] ?? code;
}

function getConsumerKeyFromCode( code ) {
    return Object.keys( consumerKeyCodes ).filter( k => consumerKeyCodes[k] === code )[0] ?? code;
}