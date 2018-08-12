
module.exports.blinkLed = (blinkTime) => {
    //led.writeSync(1);
    console.log('led on');
    setTimeout(() => {
        //led.writeSync(0);
        console.log('led off');
    }, blinkTime);
};

