var spawn = require('child_process').spawn;
var rl = require('readline');
var path = require('path');
var os = require('os');
var server = require('../server.js');
var filePath;
var monitor = require('node-usb-detection');


monitor.change(function() {
    setTimeout(function(){ 
        findRecordingPath(); 
    }, 2000);
});

var read = () => {
    var mountPoints = [];
    var df = spawn('df', []);
    var linereader = rl.createInterface(df.stdout);

    return new Promise(function (resolve) {
        linereader.on('line', function (data) {
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

    read().then(function (data) {
        var player = server.getPlayer();
        var resp;
        if (data.length > 0) {
            resp = path.join(data[0], '/');
        } else {
            resp = path.join(os.homedir(), '/Music/');
        }
        filePath = resp;
        player.setRecordingsPath(resp);
    });
};
findRecordingPath();

module.exports.getRecordingPath = () => {
    return filePath;
};