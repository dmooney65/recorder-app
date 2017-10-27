const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../settings.json');

var settings;

let readSettings = () => {
    return JSON.parse(
        fs.readFileSync(filePath, 'utf8', function (err) {
            if (err) {
                fs.copyFileSync(path.join(__dirname, '../settingsDefault.json'), path.join(__dirname, '../settings.json'));
                fs.readFileSync(path.join(__dirname, '../settings.json'));
            }
        })
    );
};

module.exports = () => {


    settings = readSettings();

    let getAll = () => {
        return settings;
    };

    let get = (setting) => {
        console.log('getAll');
        return settings[setting];
    };

    let set = (setting, value) => {
        settings[setting] = value;
    };

    let save = () => {
        fs.writeFileSync(filePath, JSON.stringify(settings), function (err) {
            if (err) {
                throw err;
            }
            settings = readSettings();
        });
        return settings;
    };

    return {
        get: get,
        getAll: getAll,
        set: set,
        save: save
    };

};


