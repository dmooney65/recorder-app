var Gpio = require('onoff').Gpio;
var led = new Gpio(24, 'out');

var Button = require('gpio-button');
var button = new Button('button25');

var time = 0;
var prev = 'release';
var pressed = 0;
var hold = 0;
var counting = false;

button.on('press', function () {
    time = 0;
    //led.writeSync(0);
    //console.log('press');
    if (prev == 'release') {
        pressed++;
    }
    if (!counting) {
        countPresses();
    }
    prev = 'press';
});

button.on('hold', function () {
    pressed = 0;
    if (time > 1000) {
        blinkLed(200, 1);
        time = 0;
        hold++;
        console.log('hold for ', hold);
    }
    time += 50;
    prev = 'hold';
});

button.on('release', function () {
    time = 0;
    hold = 0;
    if (prev == 'press') {
        //blinkLed(100,1);
        //console.log('press detected');
    }
    //blinkLed(500,0);
    //led.writeSync(0);
    prev = 'release';
});


var blinkLed = (btime, cycles) => {
    for (var i = 0; i < cycles; i++) {
        led.writeSync(1);
        setTimeout(function () {
            led.writeSync(0);
        }, btime);
    }
};


var countPresses = () => {
    counting = true;
    setTimeout(function () {
        console.log('pressed times ', pressed);
        if (pressed > 0) blinkLed(200, pressed);
        pressed = 0;
        counting = false;
    }, 1000);
};

process.on('SIGTERM', function () {
    led.unexport();
});
