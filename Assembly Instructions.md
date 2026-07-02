# KeyJam Assembly Instructions

## Parts

### PCB

* KeyJam PCB
* 11x 10kΩ 1206 SMD Resistors
* 11x MK hotswap SMD sockets
* RP2040 Zero (with headers)
* 2x SN74HC165N shift registers
* 5 pin rotary encoder
* 10k linear potentiometer

### Case

* 3D printed parts:
  * Case bottom
  * Case frame/middle
  * Case top
  * 11x keycaps
  * Rotary encoder cap
  * Slider cap
* 11x MX switches
* 4x m2.5 screws (I think, I'll check the length later, probably 10-14mm)
* 4x Clear self-adhesive rubber feet

## Assembly

### PCB - Bottom Side

The first step is to solder the SMD components on the bottom of the board. **Using a heat gun or hot plate is highly recommended for this step.** You will need the 11 smd resistors, and 11 hotswap sockets. 

Place solder on all the flat SMD (no holes in them) pads on the back of the PCB (the side that says "KeyJam" with the big logo on it). Place the 11 resistors in a line near the top, and insert the hotswap sockets into the holes. Make sure both metal tabs are over the SMD pads, and that they poke through the holes. Then use the heatgun or hotplate to solder. 

Double check all the joins to make sure they are flat and have contact with the metal.

*You can solder the hotpads conventionally, but start with SMD. Add more wire solder as needed if they fall out*

### PCB - Top Side

Place the rest of the components on the PCB:

* The RP2040 Zero goes above the RP2040 logo
* The SN74HC165Ns go in the SR_1 and SR_2 spots, make sure to match the notch
* The slider/potentiometer holes are off center, you will need to bend the pins to fit it in.
* Place the frame over the top of the PCB, then solder the rotary encoder in.

> I recommend using a wedge tip and 0.6mm 60/40 tin/lead solder

### Case

1. Place the PCB (with frame) into the bottom of the case, it should slot in
2. Place the top on
3. Use at least 4 screws in the screw holes at the bottom of the case to screw the stack together.
4. Place the MX switched into the frame
5. Place the keycaps and handles.

## Programming

Clone the git repo and use PlatformIO to flash.
