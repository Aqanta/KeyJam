#pragma once

#include <Arduino.h>
#include <vector>

class ShiftRegister {
private:
    int dataPin;
    int clockPin;
    int latchPin;
    int count;
    std::vector<int> buffer;
public:
    ShiftRegister( int dataPin, int clockPin, int latchPin, int count ) : dataPin( dataPin ), clockPin( clockPin ),
                                                                          latchPin( latchPin ), count( count ) {
        //initialize the buffer with 0s
        buffer = std::vector<int>( count );
        for ( int i = 0; i < count; i++ ) {
            buffer.at( i ) = 0;
        }
    }

    void initialize() {
        //set the pins to the correct mode
        pinMode( latchPin, OUTPUT );
        pinMode( clockPin, OUTPUT );
        pinMode( dataPin, INPUT );
    }

    void pollRegister( std::vector<int> &state ) {
        //latch low, just in case it wasn't before
        digitalWrite( latchPin, LOW );
        //latch high to show we are ready to read data
        digitalWrite( latchPin, HIGH );
        //loop through all the pins in the shift register
        for ( int i = 0; i < count; i++ ) {
            //read the data pin to get the first value
            if ( digitalRead( dataPin ) == HIGH ) {
                if ( buffer[i] > 10 && state[i] != 1 ) {
                    state[i] = 1;
                } else {
                    buffer[i]++;
                }
            } else if ( buffer[i] != 0 ) {
                buffer[i] = 0;
                state[i] = 0;
            }
            //clock up then down to cycle to the next pin on the SR
            digitalWrite( clockPin, HIGH );
            digitalWrite( clockPin, LOW );
        }
        //latch low to show we are done reading
        digitalWrite( latchPin, LOW );
    }
};