#!/bin/bash

PLAYING=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".playing"`
RECORDING=`curl -s --data "command=getStatus" http://localhost:3000/audio | jq ".recording"`


if [ "${PLAYING}" == true ]; then
    if [ "${RECORDING}" == true ]; then
        COMMAND='stopRecord'
    else
        COMMAND='startRecord'
        #flash_leds 30
    fi
    curl -s --data "command=$COMMAND" http://localhost:3000/audio
else
    echo "failed"
fi


