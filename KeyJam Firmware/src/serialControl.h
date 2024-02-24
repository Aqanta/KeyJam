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
            return serialString.substring( 0, serialString.length() - 2 );
        }
        return "";
    }

    void send( String msg ) {
        Serial.write( msg.c_str());
        Serial.write( "\r\n" );
    }
};


