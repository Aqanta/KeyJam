#include <Arduino.h>
#include <nlohmann/json.hpp>
#include <Keyboard.h>
#include <LittleFS.h>
#include <sstream>
#include <set>
#include <deque>

//define pins here
#define DATA 5
#define LATCH 7
#define CLOCK 6
//define number of buttons
#define BTN_N 16
//should we re-write the config
#define NEW_CONFIG false

//include other project files
#include "config.h"
#include "serialControl.h"
#include "shiftRegister.h"

//setup json and config
using json = nlohmann::json;
using namespace nlohmann::literals;
json currentBaseConfig;
json currentProfileConfig;

//input/button variables
std::vector<int> inputs( BTN_N );
std::vector<int> rawInputs( BTN_N );
std::vector<int> previousInputs( BTN_N );

//encoder variables
std::set<int> encoderInputs;

//slider variables
std::deque<int> sliderPin1;
std::deque<int> sliderPin2;
int sliderLevel;
int sliderPreviousLevel = -100;

//set up serial
SerialControl serialControl = SerialControl();

//set up shift register
ShiftRegister buttonRegister = ShiftRegister( DATA, CLOCK, LATCH, BTN_N );

//helper function to find the index on a vector
int getIndex( std::vector<std::string> v, const std::string &K ) {
    auto it = find( v.begin(), v.end(), K );
    if ( it != v.end()) {
        return it - v.begin();
    } else {
        return -1;
    }
}

void setup() {
    //If the config file does not exit, create it
    if ( LittleFS.begin() && (!LittleFS.exists( "/config.json" ) || NEW_CONFIG)) {
        initializeConfigFile();
    }

    //load in basic config
    File configFile = LittleFS.open( "/config.json", "r" );
    currentBaseConfig = json::parse( configFile.readString());
    configFile.close();

    //initialize the keyboard
    Keyboard.begin();
}

void loop() {
    //for each input, do the correct action
    for ( int i = 0; i < BTN_N; i++ ) {
        if ( inputs[i] == 1 && previousInputs[i] == 0 ) {
            previousInputs[i] = 1;
            if ( currentBaseConfig["inputs"][i].contains( "macro" ) && currentBaseConfig["inputs"][i]["macro"] ) {
                std::stringstream s;
                s << "press -k " << i;
                SerialControl::send( s.str());
            }
            //consumer keys
            if ( currentBaseConfig["inputs"][i].contains( "consumerKey" ) && currentBaseConfig["inputs"][i]["consumerKey"].is_number()) {
                Keyboard.consumerPress( currentBaseConfig["inputs"][i]["consumerKey"] );
            }
            //all other keys
            if ( currentBaseConfig["inputs"][i].contains( "keys" ) && !currentBaseConfig["inputs"][i]["keys"].empty()) {
                if ( currentBaseConfig["inputs"][i]["keys"].size() > 1 ||
                     (currentBaseConfig["inputs"][i].contains( "hold" ) && currentBaseConfig["inputs"][i]["hold"])) {
                    for ( const auto &j: currentBaseConfig["inputs"][i]["keys"] ) {
                        if ( j.is_number()) {
                            Keyboard.press( j );
                        } else {
                            Keyboard.press(((std::string) j).c_str()[0] );
                        }
                    }
                } else {
                    for ( const auto &j: currentBaseConfig["inputs"][i]["keys"] ) {
                        if ( j.is_number()) {
                            Keyboard.write( j );
                        } else {
                            Keyboard.write(((std::string) j).c_str()[0] );
                        }
                    }
                }
                if ( currentBaseConfig["inputs"][i]["keys"].size() > 1 &&
                     (!currentBaseConfig["inputs"][i].contains( "hold" ) || !currentBaseConfig["inputs"][i]["hold"])) {
                    for ( const auto &j: currentBaseConfig["inputs"][i]["keys"] ) {
                        if ( j.is_number()) {
                            Keyboard.release( j );
                        } else {
                            Keyboard.release(((std::string) j).c_str()[0] );
                        }
                    }
                }
            }
            //if it is an encoder, set the input to zero (encoders don't release)
            if ( encoderInputs.find( i ) != encoderInputs.end()) {
                inputs[i] = 0;
            }
        } else if ( inputs[i] == 0 && previousInputs[i] == 1 ) {
            //release key (if held)
            previousInputs[i] = 0;
            if ( currentBaseConfig["inputs"][i].contains( "hold" ) && currentBaseConfig["inputs"][i]["hold"] ) {
                for ( const auto &j: currentBaseConfig["inputs"][i]["keys"] ) {
                    if ( j.is_number()) {
                        Keyboard.release( j );
                    } else {
                        Keyboard.release(((std::string) j).c_str()[0] );
                    }
                }
            }
            if ( currentBaseConfig["inputs"][i].contains( "consumerKey" ) && currentBaseConfig["inputs"][i]["consumerKey"].is_number()) {
                Keyboard.consumerRelease();
            }
        }

    }

    //send slider updates
    if ( sliderLevel != sliderPreviousLevel ) {
        sliderPreviousLevel = sliderLevel;
        std::stringstream s;
        s << "press -s " << std::to_string( sliderLevel );
        SerialControl::send( s.str());
    }

    //read the serial port
    String msg = serialControl.check();
    if ( msg != "" ) {
        char cmd[32];
        char flag1[4];
        char option1[128];
        char flag2[4];
        char option2[128];
        char flag3[4];
        char option3[128];
        char flag4[4];
        char option4[128];
        int args = std::sscanf( msg.c_str(), "%s -%s %s -%s %s -%s %s -%s %s", cmd, flag1, option1, flag2, option2, flag3, option3, flag4, option4 );
        std::vector<std::string> params = {flag1, option1, flag2, option2, flag3, option3, flag4, option4};
        std::string command = cmd;
        if ( args > 0 && command == "update" ) {
            //TODO check for profiles
            if ( getIndex( params, "i" ) >= 0 ) {
                int inputIndex = 1 + getIndex( params, "i" );
                int valueIndex = 1 + getIndex( params, "j" );
                if ( inputIndex > 0 && valueIndex > 0 ) {
                    currentBaseConfig["inputs"][atoi( params[inputIndex].c_str())] = json::parse( params[valueIndex] );
                    saveConfigFile( currentBaseConfig );
                    SerialControl::send((String) "Updated Input" );
                }
            }
        } else if ( command == "list" ) {
            if ( getIndex( params, "c" ) >= 0 && getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "base" ) {
                SerialControl::send( currentBaseConfig.dump());
            } else if ( getIndex( params, "c" ) >= 0 && getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "app" ) {
                SerialControl::send( currentProfileConfig.dump());
            } else if ( getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "map" ) {
                SerialControl::send( inputMap.dump());
            }
        }
    }

    delay( 10 );
}

std::vector<bool> encoderOn;

void setup1() {
    //sets pin values
    buttonRegister.initialize();
    for ( int i = 0; i < inputMap["encoders"].size(); i++ ) {
        encoderInputs.insert((int) inputMap["encoders"][i]["s1"] );
        encoderInputs.insert((int) inputMap["encoders"][i]["s2"] );
        encoderOn.push_back( false );
    }

    //slider pins
    pinMode( 15, OUTPUT );
    pinMode( 26, INPUT );
    pinMode( 29, INPUT );
}

void loop1() {
    //get inputs from shift register
    buttonRegister.pollRegister( rawInputs );

    for ( int i = 0; i < rawInputs.size(); i++ ) {
        if ( encoderInputs.find( i ) == encoderInputs.end()) {
            inputs[i] = rawInputs[i];
        }
    }

    //read and set encoder state
    for ( int i = 0; i < inputMap["encoders"].size(); i++ ) {
        int s1 = inputMap["encoders"][i]["s1"];
        int s2 = inputMap["encoders"][i]["s2"];
        int clk = inputMap["encoders"][i]["buttonInput"];
        if ( rawInputs[s1] == 0 && rawInputs[s2] == 0 ) {
            inputs[s1] = 0;
            inputs[s2] = 0;
            encoderOn[i] = false;
        } else if ( !encoderOn[i] && rawInputs[s1] == 1 && rawInputs[s2] == 0 ) {
            inputs[s1] = 1;
            inputs[s2] = 0;
            encoderOn[i] = true;
        } else if ( !encoderOn[i] && rawInputs[s1] == 0 && rawInputs[s2] == 1 ) {
            inputs[s1] = 0;
            inputs[s2] = 1;
            encoderOn[i] = true;
        }
        if ( rawInputs[clk] == 0 ) {
            inputs[clk] = 0;
        }
    }

    //get slider level
    digitalWrite( 15, HIGH );
    delayMicroseconds( 1 );

    sliderPin1.push_front( analogRead( 26 ));
    sliderPin2.push_front( analogRead( 29 ));
    digitalWrite( 15, LOW );

    if ( sliderPin1.size() > 50 ) {
        sliderPin1.pop_back();
        sliderPin2.pop_back();
    }

    int pin1avg = 0;
    for ( int t: sliderPin1 ) {
        pin1avg += t;
    }
    pin1avg = pin1avg / sliderPin1.size();


#ifdef TWO_RESISTOR
    int pin2avg = 0;
    for ( int t: sliderPin2 ) {
        pin2avg += t;
    }
    pin2avg = pin2avg / sliderPin2.size();
    sliderLevel = ((int) ((std::log( pin2avg / std::log( 1.005 ))) * 22) - 140) / 5;
     if ( pin1avg < 70 && sliderLevel > 17 ) {
        sliderLevel -= 1;
    }
      if ( pin1avg > 70 ) {
        sliderLevel = 20;
    }
      sliderLevel *= 5;
#else
    sliderLevel = (int) ((std::log( pin1avg ) * 23.63) - 32.769);
#endif
    if ( sliderLevel < 4 ) {
        sliderLevel = 0;
    }
    if(sliderLevel > 96){
        sliderLevel = 100;
    }

    delayMicroseconds( 2 );
}
