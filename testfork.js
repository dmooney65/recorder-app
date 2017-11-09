
const { spawn } = require('child_process');
const fs = require('fs');
var file = fs.createReadStream('./bootstrap/css/bootstrap.css');


var args = [ './testchild.js', /* command arguments */ ];
var child = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });

var arecord = spawn(
    'arecord', ['-f', 'S16_LE', '-c', 2,
        '-r', '48000', '-t', 'wav', '-D', 'plug:default']
);

arecord.stdout.pipe(child.stdin);