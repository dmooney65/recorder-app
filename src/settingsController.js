const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../settings.json');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);


module.exports.get = () => {
    return readFileAsync(filePath, { encoding: 'utf8' }).then((data) => {
        if (data) {
            return JSON.parse(data);
        } else {
            throw "could not open settings file 1"
        }
    }).catch((err) => {
        console.log(err);
        return readFileAsync(filePath, { encoding: 'utf8' }).then((data) => {
            if (data) {
                return JSON.parse(data);
            } else {
                throw "could not open settings file 2"
            }
        });

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
    return writeFileAsync(filePath, JSON.stringify(settings), { encoding: 'utf8' }).then((err) => {
        if (err) throw err;
        console.log('settings to save: ', settings)
        global.audioWorker.send({ command: 'settings', arg: settings });
        return settings;
    });

};

module.exports.save = (newSettings) => {

    readFileAsync(filePath).then((data) => {

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
        writeFileAsync(filePath, JSON.stringify(settings), { encoding: 'utf8' }).then((err) => {
            if (err) throw err;
            global.audioWorker.send({ command: 'settings', arg: settings });
            //return settings;
        });

    });

};




