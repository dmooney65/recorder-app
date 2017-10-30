var spawn = require('child_process').spawn;
var rl = require('readline');
var path = require('path');
var os = require('os');

var filePath;
var monitor = require('node-usb-detection');


//console.log('Usb Devices:\n', monitor.list());

/*monitor.add(function() {
    //setTimeout(function(){ findRecordingPath(); }, 3000);
    
    console.log('added device:\n', filePath);
});

monitor.remove(function() {
    //setTimeout(function(){ findRecordingPath(); }, 3000);
    console.log('removed device:\n', filePath);
});*/

monitor.change(function() {
    setTimeout(function(){ findRecordingPath(); }, 3000);
    //console.log('device changed:\n', filePath);
});

var read = () => {
    var mountPoints = [];
    var df = spawn('df', []);
    var linereader = rl.createInterface(df.stdout);

    return new Promise(function (resolve) {
        linereader.on('line', function (data) {
            if (data.toString().substr(0, 7) == '/dev/sd') {
                if (data.includes('/media/')) {
                    //console.log('line found');
                    var mountPoint = data.substr(data.indexOf('/media/'), data.length);
                    //console.log('mount ' + mountPoint);
                    mountPoints.push(mountPoint);
                    //console.log(mountPoints);
                }
            }
            resolve(mountPoints);
        });
    });
};

let findRecordingPath = () => {
    //console.log('recPath called');
    read().then(function (data) {
        if (data.length > 0) {
            filePath = path.join(data[0], '/');
        } else {
            filePath = path.join(os.homedir(), '/Music/');
        }
    });
};
findRecordingPath();

module.exports.getRecordingPath = () => {
    //findRecordingPath();
    console.log(filePath);
    return filePath;
};