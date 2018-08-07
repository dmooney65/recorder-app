const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../settings.json');

var settings;

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

module.exports = () => {


    let readSettings = () => {
        settings = fs.readFileAsync(filePath).then((data) => {
            settings = JSON.parse(data);
            return settings;
        }
        ).catch((error) => {
            console.log(error);
            var captureDevice = 'default';
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
                    captureDevice = 'hw:0,0';
                    playbackDevice = 'hw:0,0';
                    native24bit = 'true';
                } else if (stdout.includes('audioinjector')) {
                    audioCard = 'audioinjector';
                    captureDevice = 'hw:0,0';
                    playbackDevice = 'hw:0,0';
                    native24bit = 'true';
                }
                //console.log(stdout);
                settings = { 'bitDepth': '16', 'sampleRate': '48000', 'compressionLevel': '5', 
                    'mp3Rate': '3', 'captureDevice': captureDevice, 'highResFormat': 'flac', 
                    'native24Bit': native24bit, 'bitFormat': 'S16_LE', 'inputAs32': false, 
                    'playbackDevice': playbackDevice, 'audioCard': audioCard };
                save();
            });
        });
    };

    let getAll = () => {
        return settings;
    };

    let get = (setting) => {
        return settings[setting];
    };

    let set = (setting, value) => {
        settings[setting] = value;
    };

    let save = () => {
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
            settings = readSettings();
            //return settings;
        }
        );
        return settings;
    };

    readSettings();

    return {
        get: get,
        getAll: getAll,
        set: set,
        save: save,
    };

};


