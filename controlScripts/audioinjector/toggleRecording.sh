#!/bin/bash

source /home/pi/source/recorder-app/controlScripts/audioinjector/led.sh

PLAYING=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".status" | jq ".playing"`
RECORDING=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".status" | jq ".recording"`


if [ "${PLAYING}" == true ]; then
    if [ "${RECORDING}" == true ]; then
        COMMAND='stopRecord'
        flash_leds 20
    else
        COMMAND='startRecord'
        #flash_leds 30
    fi
    curl -s --data "command=$COMMAND" http://localhost:3000/audio
    sleep 0.5
    flash_leds 20
else
    flash_leds 100
fi


