#pragma once

#include "LittleFS.h"
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace nlohmann::literals;

void initializeConfigFile() {
    json config;
    config["buttons"] = {};
    for ( int i = 0; i < BTN_N; i++ ) {
        config["buttons"][i] = {
                {"macro", false},
                {"keys",  {}},
                {"hold",  false}
        };
    }
    File configFile = LittleFS.open( "/config.json", "w" );
    configFile.write( config.dump().c_str());
    configFile.close();
}