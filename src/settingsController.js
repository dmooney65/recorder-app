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
            settings = { 'bitDepth': '16', 'sampleRate': '48000', 'compressionLevel': '5', 'mp3Rate': '3', 'defaultCard': 'plug:default', 'highResFormat': 'flac', 'native24Bit': 'false', 'bitFormat': 'S16_LE', 'inputAs32': false, 'audioCard': 'default' };
            return settings;
        });
        console.log('settings ',settings);
    };

    readSettings();

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
        if (process.env.AUDIO_CARD) {
            settings.audioCard = process.env.AUDIO_CARD;
        } else {
            settings.audioCard = 'default';
        }

        fs.writeFileAsync(filePath, JSON.stringify(settings)).then(
            function () {
                readSettings();
            }
        );
        return settings;
    };

    return {
        get: get,
        getAll: getAll,
        set: set,
        save: save
    };

};


