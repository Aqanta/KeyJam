## Serial Communication Protocol

This page describes how communication between the control app (Electron) and the RP2040 microcontroller (macropad) works.
All communication is done over the USB serial port and is primarily for setting key mappings.

>The RP2040 has a 50 byte serial buffer. More than 50 bytes could be sent in a command, but it would require breaking the data apart and sending with gaps to give the RP2040 time to process it.

### Definitions
* Keymapping
  * A map of what keys on the macropad press what keyboard keys or trigger macros
  * i.e. key 26 presses 'paste' or 'CONTROL + V'
* Profile
  * Set of keymappings
  * There are two levels of profiles, base and app
* Base Profile
  * This profile has mappings for all keys
  * One (and only one) must be applied at all times
* App Profile
  * Has mappings for some, but not all keys
  * Overrides base profile (where there is overlap)
  * Support for only 1 applied at a time (could be changed?)
* Keystroke
  * The RP2040 sends HID keyboard data stating a key is pressed
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

>These only take keystrokes into consideration. If built in, RGB lights will need some control too

### Protocol
* All messages end with `\r\n`
  * A message is incrementally stored and not processed until `\r\n` is read
* Messages are send in a command line style, with parameters seperated by spaces and options set by flags
  * `update -p Windows -i btn_3 -k VOLUME_UP` tells the controller to update key 3 to press the volume up key on the 'Windows' profile
* When receiving data the number of bytes it received is sent back to show it received the request
* All responses to commands are given in JSON
* Commands
  * Commands signify what action is to be taken. The following is an exhaustive list of commands:
  * App to Device
    * `update` - Updates a keymapping
    * `create` - Creates a new profile (none-destructive)
    * `exists` - Checks to see if a profile exists
    * `read` - Reads a profile or mapping
    * `list` - lists the loaded profiles or set key mappings
  * Device to App
    * `press` - A macro key was pressed
* Flags
  * Flags are common across commands, though not every flag can be used in every command
    * `-p` - an app profile
    * `-b` - base profile
    * `-n` - name
    * `-i` - an input (`btn_3`, `rotary_1`)
    * `-k` - an output key (`a`, `ARROW-UP`)
    * `-l` - a list (JSON array) of output keys (`["SHIFT","A"]`)
    * `-h` - don't hold the key, just press it