#include <Arduino.h>
#include <json.hpp>
#include <Keyboard.h>
#include <LittleFS.h>
#include <sstream>

//define pins here
#define DATA 28
#define LATCH 26
#define CLOCK 27

//define number of buttons
#define BTN_N 8

#define NEW_CONFIG false

#include "setup.h"
#include "serialControl.h"
#include "shiftRegister.h"

std::vector<int> buttons( BTN_N );
std::vector<int> previousButtons( BTN_N );
json currentConfig;
SerialControl serialControl = SerialControl();
ShiftRegister buttonRegister = ShiftRegister( DATA, CLOCK, LATCH, BTN_N );

void setup() {
    //If the config file does not exit, create it
    if ( LittleFS.begin() && (!LittleFS.exists( "/config.json" ) || NEW_CONFIG)) {
        initializeConfigFile();
    }

    //load in basic config
    File configFile = LittleFS.open( "/config.json", "r" );
    currentConfig = json::parse( configFile.readString());
    configFile.close();

    //initialize the keyboard
    Keyboard.begin();

    pinMode( 15, OUTPUT );
}

void loop() {
    for ( int i = 0; i < BTN_N; i++ ) {
        if ( buttons[i] == 1 && previousButtons[i] == 0 ) {
            previousButtons[i] = 1;
            if ( currentConfig["buttonMapping"][i] == "MACRO" ) {
                std::stringstream s;
                s << "press -k " << i;
                serialControl.send( s.str().c_str());
            }
            //TODO press key
            //TODO trigger key combo
        } else if ( buttons[i] == 0 && previousButtons[i] == 1 ) {
            previousButtons[i] = 0;
            //TODO release key (if needed)
        }
    }

    String msg = serialControl.check();
    if ( msg != "" ) {
        //TODO do something with the command
    }

    delay( 10 );
}

void setup1() {
    //sets pin values
    buttonRegister.initialize();
}

void loop1() {
    buttonRegister.pollRegister( buttons );

    delay( 5 );
}