#include <Arduino.h>
#include <nlohmann/json.hpp>
#include <Keyboard.h>
#include <LittleFS.h>
#include <sstream>
#include <set>

//define pins here
#define DATA 5
#define LATCH 7
#define CLOCK 6

//define number of buttons
#define BTN_N 16

#define NEW_CONFIG false

#include "config.h"
#include "serialControl.h"
#include "shiftRegister.h"

using json = nlohmann::json;
using namespace nlohmann::literals;

json currentBaseConfig;
json currentProfileConfig;

std::vector<int> inputs( BTN_N );
std::vector<int> rawInputs( BTN_N );
std::vector<int> previousInputs( BTN_N );
std::set<int> encoderInputs;
SerialControl serialControl = SerialControl();
ShiftRegister buttonRegister = ShiftRegister( DATA, CLOCK, LATCH, BTN_N );

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

    //pinMode( 14, OUTPUT );
}

void loop() {
    for ( int i = 0; i < BTN_N; i++ ) {
        if ( inputs[i] == 1 && previousInputs[i] == 0 ) {
            previousInputs[i] = 1;
            if ( currentBaseConfig["inputs"][i].contains( "macro" ) && currentBaseConfig["inputs"][i]["macro"] ) {
                std::stringstream s;
                s << "press -k " << i;
                SerialControl::send( s.str());
            }
            //TODO press key
            //TODO trigger key combo
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
            if ( encoderInputs.find( i ) != encoderInputs.end()) {
                inputs[i] = 0;
            }
        } else if ( inputs[i] == 0 && previousInputs[i] == 1 ) {
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
            //TODO release key (if needed)
        }

    }

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
                    SerialControl::send((String) "Trying to update button" );
                    currentBaseConfig["inputs"][atoi( params[inputIndex].c_str())] = json::parse( params[valueIndex] );
                    saveConfigFile( currentBaseConfig );
                    SerialControl::send((String) "Updated Input" );
                }
            }
            //TODO Handle rotary encoders
        } else if ( command == "list" ) {
            if ( getIndex( params, "c" ) >= 0 && getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "base" ) {
                SerialControl::send( currentBaseConfig.dump());
            } else if ( getIndex( params, "c" ) >= 0 && getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "app" ) {
                SerialControl::send( currentProfileConfig.dump());
            } else if ( getIndex( params, "p" ) >= 0 && params[getIndex( params, "p" ) + 1] == "map" ) {
                SerialControl::send( inputMap.dump());
            }
        }
        //TODO do something with the command
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
}

void loop1() {
    buttonRegister.pollRegister( rawInputs );

    for ( int i = 0; i < rawInputs.size(); i++ ) {
        if ( encoderInputs.find( i ) == encoderInputs.end()) {
            inputs[i] = rawInputs[i];
        }
    }

    for ( int i = 0; i < inputMap["encoders"].size(); i++ ) {
        int s1 = inputMap["encoders"][i]["s1"];
        int s2 = inputMap["encoders"][i]["s2"];
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
    }

    delayMicroseconds( 4 );
}
