
const { spawn } = require('child_process');
//const fs = require('fs');
var settings = '{"bitDepth":"24","sampleRate":"48000","compressionLevel":"5","bitFormat":"S32_LE","inputAs32":true,"mp3Rate":"0","defaultCard":"plug:default","highResFormat":"wav"}';
console.log(settings);

var recPath = '/home/dominic/Music/';
var args = [ './src/audioWorker.js', recPath, settings ];
var child = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });

var arecord = spawn(
    'arecord', ['-f', 'S32_LE', '-c', 2,
        '-r', '48000', '-t', 'wav', '-D', 'plug:default']
);
var aplay = spawn('aplay', ['-D', 'plug:default']);

arecord.stdout.pipe(aplay.stdin);
arecord.stdout.pipe(child.stdin);