var spawn = require('child_process').spawn;
var rl = require('readline');
var df = spawn('df', []);


var linereader = rl.createInterface({ input: df.stdout });
var mountPoints = [];


var read = () => {
    return new Promise(function (resolve) {

        linereader.on('line', function (data) {
            //console.log(data);
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
read().then(function (data) { //console.log(data); 
    console.log(data);
});
console.log('MP ' +mountPoints);
