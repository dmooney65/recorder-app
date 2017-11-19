const Gpio = require('onoff').Gpio;
const led = new Gpio(24, 'out');
const { exec } = require('child_process');

const Button = require('gpio-button');
const button = new Button('button25');

let time = 0;
let prev = 'release';
let pressed = 0;
let hold = 0;

process.on('SIGTERM', function() {
    //console.log('SIGTERM');
    led.unexport();    
    // do whatever to terminate properly
    // at worst, just 'exit(0)'
    process.exit(0);
});

process.on('SIGINT', function() {
    //console.log('SIGINT');
    led.unexport();    
    // do whatever to terminate properly
    // at worst, just 'exit(0)'
    process.exit(0);
});

button.on('press', function () {
    time = 0;
    if (prev == 'release') {
        pressed++;
        countPresses();
    } else {
        pressed = 0;
    }
    prev = 'press';
});

button.on('hold', function () {
    pressed = 0;
    if (time > 1000) {
        blinkLed(200, 1);
        time = 0;
        hold++;
    }
    time += 50;
    prev = 'hold';
});

button.on('release', function () {
    if(hold > 0){
        doHoldAction(hold);
        //blinkLed(100, 3);
    }
    time = 0;
    hold = 0;
    prev = 'release';
});

var blinkLed = (blinkTime, blinkCycles) => {
    
    var interval = setInterval(() => {
        led.writeSync(1);
        setTimeout(() => {
            led.writeSync(0);
        }, blinkTime);
    }, blinkTime + 100);
    
    setTimeout(() => {
        clearInterval(interval);
    }, (blinkTime + 101) * (blinkCycles));
};


var countPresses = () => {
    // If button not pressed within timeout, stop adding to pressed count and do actions
    setTimeout(function () {
        if (!button.pressed()) {
            doClickAction(pressed);
            pressed = 0;
            //counting = false;
        }
    }, 300);
};



var doClickAction = (presses) => {
    switch (presses) {
    case 1:
        exec(__dirname+'/togglePlaying.sh',
            {
                stdio: 'ignore'
            });
        blinkLed(150, presses);
        break;
    case 2:
        exec(__dirname+'/toggleRecording.sh',
            {
                stdio: 'ignore'
            });
        blinkLed(150, presses);
        break;
    default:
        console.log('no action');
        break;
    }
};

var doHoldAction = (held) => {
    console.log('held times ', held);
    switch (held) {
    case 5:
        blinkLed(150, held);
        setTimeout(() => {
            exec('sudo shutdown now',
                {
                    stdio: 'ignore'
                });
        },2000);
        break;
    default:
        console.log('no action');
        break;
    }
};
