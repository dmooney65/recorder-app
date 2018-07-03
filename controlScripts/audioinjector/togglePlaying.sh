#!/bin/bash

source /home/pi/source/recorder-app/controlScripts/audioinjector/led.sh

PLAYING=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".status" | jq ".playing"`


if [ "${PLAYING}" == true ]; then
    COMMAND='stop'
    flash_leds 30
else
    COMMAND='play'
    #flash_leds 10
    #sleep 0.5
    #flash_leds 10
fi

curl -s --data "command=$COMMAND" http://localhost:3000/audio

