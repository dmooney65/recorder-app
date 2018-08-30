const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../settings.json');

fs.readFileAsync = ((filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
});

fs.writeFileAsync = ((filename, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, content, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
});

module.exports.get = () => {
    return fs.readFileAsync(filePath).then((data) => {
        var settings = JSON.parse(data.toString());
        return settings;
    });
};

module.exports.createDefault = () => {
    var settings;
    var captureDevice = 'hw:0,0';
    var playbackDevice = 'default';
    var audioCard = 'generic';
    var native24bit = 'false';
    var cmdline = 'ls /sys/bus/platform/drivers | grep "pisound\\|audioinj"';
    require('child_process').exec(cmdline, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr);
        }
        if (stdout.includes('pisound')) {
            audioCard = 'pisound';
            native24bit = 'true';
        } else if (stdout.includes('audioinjector')) {
            audioCard = 'audioinjector';
            native24bit = 'true';
        }
    });
    settings = {
        'bitDepth': '16', 'sampleRate': '48000', 'compressionLevel': '5',
        'mp3Rate': '0', 'captureDevice': captureDevice, 'highResFormat': 'flac',
        'native24Bit': native24bit, 'bitFormat': 'S16_LE', 'inputAs32': false,
        'playbackDevice': playbackDevice, 'audioCard': audioCard, 'buttonControl': false
    };
    return fs.writeFileAsync(filePath, JSON.stringify(settings)).then((err) => {
        if (err) throw err;
        global.audioWorker.send({ command: 'settings', arg: settings });
    });

};

module.exports.save = (newSettings) => {

    fs.readFileAsync(filePath).then((data) => {

        var settings = JSON.parse(data.toString());
        for (var property in newSettings) {
            if (newSettings.hasOwnProperty(property)) {
                settings[property] = newSettings[property];
            }
        }

        if (settings.bitDepth == '24') {
            if (settings.highResFormat == 'wav' || settings.native24Bit == 'false') {
                settings.bitFormat = 'S32_LE';
            } else {
                settings.bitFormat = 'S24_LE';
            }
            settings.inputAs32 = true;
        } else {
            settings.bitFormat = 'S16_LE';
            settings.inputAs32 = false;
        }
        fs.writeFileAsync(filePath, JSON.stringify(settings)).then((err) => {
            if (err) throw err;
            global.audioWorker.send({ command: 'settings', arg: settings });
        });

    });

};




