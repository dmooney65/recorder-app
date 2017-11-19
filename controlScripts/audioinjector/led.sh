LED_FILE="/sys/class/gpio/gpio24/value"
flash_leds() {
    sudo sh -c "echo 1 > $LED_FILE"
    x=$1
    y=100
    DURATION=$(echo "scale = 2; $1/100" | bc)
    echo $DURATION
    sleep $DURATION
    sudo sh -c "echo 0 > $LED_FILE"
}
