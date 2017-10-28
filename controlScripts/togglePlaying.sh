#!/bin/bash

./led.sh

STATUS=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".playing"`


if [ "${STATUS}" == true ]; then
    COMMAND='stop'
else
    COMMAND='play'
fi

curl -s --data "command=$COMMAND" http://localhost:3000/audio

flash_leds 100