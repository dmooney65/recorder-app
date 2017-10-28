#/bin/bash

PISOUND_LED_FILE="/sys/kernel/pisound/led"

if [ -e $PISOUND_LED_FILE ]; then
        flash_leds() {
                sudo sh -c "echo $1 > $PISOUND_LED_FILE"
        }

fi