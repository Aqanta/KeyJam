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

// Consumer keys, taken from TinyUSB and incremented by 255

    POWER: 303,
    RESET: 304,
    SLEEP: 305,
    BRIGHTNESS_INCREMENT: 366,
    BRIGHTNESS_DECREMENT: 367,
    WIRELESS_RADIO_CONTROLS: 267,
    WIRELESS_RADIO_BUTTONS: 453,
    WIRELESS_RADIO_LED: 454,
    WIRELESS_RADIO_SLIDER_SWITCH: 455,
    PLAY_PAUSE: 460,
    SCAN_NEXT: 436,
    SCAN_PREVIOUS: 437,
    STOP: 438,
    VOLUME: 479,
    MUTE: 481,
    BASS: 482,
    TREBLE: 483,
    BASS_BOOST: 484,
    VOLUME_INCREMENT: 488,
    VOLUME_DECREMENT: 489,
    BASS_INCREMENT: 593,
    BASS_DECREMENT: 594,
    TREBLE_INCREMENT: 595,
    TREBLE_DECREMENT: 596,
    AL_CONSUMER_CONTROL_CONFIGURATION: 642,
    AL_EMAIL_READER: 649,
    AL_CALCULATOR: 657,
    AL_LOCAL_BROWSER: 659,
    AC_SEARCH: 800,
    AC_HOME: 802,
    AC_BACK: 803,
    AC_FORWARD: 804,
    AC_STOP: 805,
    AC_REFRESH: 806,
    AC_BOOKMARKS: 809,
    AC_PAN: 823

}

function getKeyFromCode( code ) {
    if ( typeof code === "string" ) {
        return code;
    }
    return Object.keys( keyCodes ).filter( k => keyCodes[k] === code )[0];
}