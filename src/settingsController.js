const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../settings.json');

fs.readFileAsync = function (filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
};

fs.writeFileAsync = function (filename, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, content, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};

module.exports.get = () => {
    return fs.readFileAsync(filePath).then((data) => {
        var settings = JSON.parse(data);
        return settings;
    });//.catch((error) => {
    //console.log(error);

    //});
};

let createDefault = () => {
    var settings;
    var captureDevice = 'hw:0,0';
    var playbackDevice = 'default';
    var audioCard = 'generic';
    var native24bit = 'false';
    var cmdline = 'ls /sys/bus/platform/drivers | grep "pisound\\|audioinj"';
    require('child_process').exec(cmdline, function (error, stdout, stderr) {
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
    fs.writeFileAsync(filePath, JSON.stringify(settings)).then((err) => {
        if (err) throw err;
        global.audioWorker.send({ command: 'settings', arg: settings });
    });

};

module.exports.save = (newSettings) => {

    fs.readFileAsync(filePath).then((data) => {

        var settings = JSON.parse(data);
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




