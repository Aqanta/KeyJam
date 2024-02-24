#pragma once
#include "LittleFS.h"
#include "json.hpp"

using json = nlohmann::json;
using namespace nlohmann::literals;

void initializeConfigFile() {
    json config;
    config["buttonMapping"] = {};
    for ( int i = 0; i < BTN_N; i++ ) {
        config["buttonMapping"][i] = "MACRO";
    }
    File configFile = LittleFS.open( "/config.json", "w" );
    configFile.write( config.dump( 2 ).c_str());
    configFile.close();
}