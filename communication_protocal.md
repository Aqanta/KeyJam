## Serial Communication Protocol

This page describes how communication between the control app (Electron) and the KeyJam (RP2040 microcontroller) works.
All communication is done over the USB serial port and is primarily for setting key mappings.

>All serial commands are sent as text strings. No upper character limit has been observed.

### Definitions
* Keymapping
  * A map of what keys on the macropad press what keyboard keys or trigger macros
  * i.e. key 26 presses 'CONTROL + V'
* Profile
  * Set of keymappings
  * There are two levels of profiles, base and app
* Base Profile
  * This profile has mappings for all keys
  * One (and only one) must be applied at all times
* App Profile
  * Has mappings for some, but not all keys
  * Overrides base profile (where there is overlap)
  * Support for only 1 applied at a time (could be increased later)
* Keystroke
  * KeyJam sending an HID keyboard data stating a key is pressed
  * Three basic types: printing/non-printing, modifier, & consumer
  * Can be held down or pressed and released immediately
* Macro
  * A command to do something other than a keystroke
  * Almost always handled by the control software on the computer
  * i.e. key 13 sends a GET request to a URL

### Purposes & Functions
##### App to Device
* Set a keymapping (edit profile)
  * Per profile
  * Can be a keystroke or macro
* Create a profile
* Switch base profile
* Switch app profile
* Request profile data
##### Device to App
* Trigger macro

>These only take keystrokes into consideration. If built in, RGB lights will be controlled similarly

### Protocol
* All messages end with `\r\n`
  * A message is incrementally stored and not processed until `\r\n` is read
* Messages are send in a command line style, with parameters seperated by spaces and options set by flags
  * `list -c y -p base` tells the KeyJam to send the current base profile over serial
* Most responses to commands are given in JSON
#### Message structure
* Commands
  * Commands signify what action is to be taken. The following is an exhaustive list of commands:
  * App to Device
    * `update` - Updates a keymapping
    * `create` - Creates a new profile (non-destructive)
    * `list` - Returns a list of saved profiles, or the contents of a specified profile
  * Device to App
    * `press` - A macro key was pressed
* Flags
  * Flags are common across commands, though not every flag can be used in every command
    * `-p` - an profile (by id)
    * `-pt` - specifies profile type (can be `base` or `app`)
    * `-i` - the input number
    * `-j` - A JSON object (usually a key profile)
    * ~~`-it` - input type (`button`, `rotary`, etc.)~~

### Key JSON Format

```json
{
  "macro": false,
  "keys": ["a", 128],
  "consumerKey": 205,
  "hold": false
}
```

The `macro` boolean tells the controller if it should send the key press over the serial port.

The `keys` array lists all the keys that will send over via HID to the computer

The `consumerKey` integer contains a keycode for a consumer key

The `hold` boolean controls whether the keys are 'held down' or quickly presses and released.

All fields are optional, but it is encouraged to put a false value if there is no action to be taken.

### Profile JSON format

Each profile is an object with the following properties:

````json
{
  "id": "default",
  "displayName": "Default",
  "buttons": [],
  "rotaryEncoders": [],
  "potentiometers": []
}
````
Each button, rotary encoder, & potentiometer has a zero-based index associated with it. Each category has a list with a key (or key like object) in it.