var spawn = require('child_process').spawn;
var rl = require('readline');
var path = require('path');
var os = require('os');
var filePath;
var monitor = require('usb-detection');



monitor.on('change', (device) => {
    console.log("device changed:\n", device);
    setTimeout(() => {
        findRecordingPath();
    }, 3000);
});

var read = () => {
    var mountPoints = [];
    var df = spawn('df', []);
    var linereader = rl.createInterface(df.stdout);

    return new Promise((resolve) => {
        linereader.on('line', (data) => {
            if (data.toString().substr(0, 7) == '/dev/sd') {
                if (data.includes('/media/')) {
                    var mountPoint = data.substr(data.indexOf('/media/'), data.length);
                    mountPoints.push(mountPoint);
                }
            }
            resolve(mountPoints);
        });
    });
};


var findRecordingPath = () => {
    read().then((data) => {
        var resp;
        if (data.length > 0) {
            resp = path.join(data[0], '/');
        } else {
            resp = path.join(os.homedir(), '/Music/');
        }
        filePath = resp;
        global.audioWorker.send({ command: 'setRecordingsPath', arg: resp });
        return resp;
    });
};
monitor.startMonitoring();
findRecordingPath();

module.exports.getRecordingPath = () => {
    return filePath;
};

module.exports.stopMonitoring = () => {
    monitor.stopMonitoring();
}