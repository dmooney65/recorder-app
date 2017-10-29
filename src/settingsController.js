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
        settings = fs.readFileAsync(filePath).then(
            function (data) {
                settings = JSON.parse(data);
                return settings;
            }
        );
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


