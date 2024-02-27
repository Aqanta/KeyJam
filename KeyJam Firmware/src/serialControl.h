#pragma once

#include <Arduino.h>

class SerialControl {
private:
    String serialString;
public:
    String check() {
        while ( Serial.available() > 0 ) {
            serialString += (char) Serial.read();
        }
        if ( serialString[serialString.length() - 1] == '\n' && serialString[serialString.length() - 2] == '\r' ) {

            String rtnString = serialString.substring( 0, serialString.length() - 2 );
            serialString = "";
            return rtnString;
        }
        return "";
    }

    static void send( const std::string &msg ) {
        Serial.write( msg.c_str());
        Serial.write( "\r\n" );
    }

    static void send( const String &msg ) {
        Serial.write( msg.c_str());
        Serial.write( "\r\n" );
    }
};


