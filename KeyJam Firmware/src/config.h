#pragma once

#include "LittleFS.h"
#include <nlohmann/json.hpp>

#include "serialControl.h"

using json = nlohmann::json;
using namespace nlohmann::literals;

void initializeConfigFile() {
    LittleFS.format();
    json config;
    config["inputs"] = {};
    for ( int i = 0; i < BTN_N; i++ ) {
        config["inputs"][i] = {
                {"macro",       false},
                {"keys",        {}},
                {"hold",        false},
                {"consumerKey", false}
        };
    }
    File configFile = LittleFS.open( "/config.json", "w" );
    configFile.write( config.dump().c_str());
    configFile.close();
}

void saveConfigFile( const json &config ) {
    SerialControl::send((String) "Saving config" );
    File configFile = LittleFS.open( "/config.json", "w" );
    SerialControl::send((String) "Opened File" );
    configFile.write( config.dump().c_str());
    configFile.close();
}

json inputMap = {
        {"buttons", {
                {
                        {"name", "BTN_1"},
                        {"x", 1},
                        {"y", 0},
                        {"input", 15}
                },
                {
                        {"name", "BTN_2"},
                        {"x", 2,},
                        {"y", 0,},
                        {"input", 2},
                },
                {
                        {"name", "BTN_3"},
                        {"x", 3},
                        {"y", 0},
                        {"input", 6}
                },
                {
                        {"name", "BTN_4"},
                        {"x", 0},
                        {"y", 1},
                        {"input", 14}
                },
                {
                        {"name", "BTN_5"},
                        {"x", 1},
                        {"y", 1},
                        {"input", 4}
                },
                {
                        {"name", "BTN_6"},
                        {"x", 2,},
                        {"y", 1,},
                        {"input", 5},
                },
                {
                        {"name", "BTN_7"},
                        {"x", 3},
                        {"y", 1},
                        {"input", 0}
                },
                {
                        {"name", "BTN_8"},
                        {"x", 0},
                        {"y", 2},
                        {"input", 8}
                },
                {
                        {"name", "BTN_9"},
                        {"x", 1},
                        {"y", 2},
                        {"input", 3}
                },
                {
                        {"name", "BTN_10"},
                        {"x", 2,},
                        {"y", 2,},
                        {"input", 1},
                },
                {
                        {"name", "BTN_11"},
                        {"x", 3},
                        {"y", 2},
                        {"input", 7}
                }
        }},
        {"encoders", {
                {
                        {"name", "Dial"},
                        {"x", 0},
                        {"y", 0},
                        {"buttonInput", 13},
                        {"s1", 12},
                        {"s2", 11}
                }
        }}
};

/*json inputMap = {
        {"buttons", {
                {
                        {"name", "BTN_1"},
                        {"x", 0},
                        {"y", 0},
                        {"input", 3}
                },
                {
                        {"name", "BTN_2"},
                        {"x", 4,},
                        {"y", 0,},
                        {"input", 5},
                },
                {
                        {"name", "BTN_3"},
                        {"x", 0},
                        {"y", 1},
                        {"input", 2}
                },
                {
                        {"name", "BTN_4"},
                        {"x", 1},
                        {"y", 1},
                        {"input", 1}
                },
                {
                        {"name", "BTN_5"},
                        {"x", 2},
                        {"y", 1},
                        {"input", 0}
                },
                {
                        {"name", "BTN_6"},
                        {"x", 3},
                        {"y", 1},
                        {"input", 7}
                },
                {
                        {"name", "BTN_7"},
                        {"x", 4},
                        {"y", 1},
                        {"input", 4}
                },
        }}
};*/