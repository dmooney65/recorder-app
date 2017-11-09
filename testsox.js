const path = require('path');
var fs = require('fs');
const execStream = require('exec-stream');
var sox = require('sox-stream');

//var command1 = ffmpeg();
const { PassThrough } = require('stream');
const pass = new PassThrough();


var stream  = fs.createWriteStream('outputfile.flac');

var src = fs.createReadStream('Old_Man.wav');

var arecord = execStream(
    'arecord', ['-f', 'S16_LE', '-c', 2,
        '-r', 48000, '-D', 'hw:0,0']
);
var aplay = execStream('aplay', ['-D', 'plug:default']);

//var pass = new stream.PassThrough();
//arecord.pipe(aplay);

var transcode = sox({
    output: {
        bits: 16,
        rate: 44100,
        channels: 2,
        type: 'wav'
    }
});
transcode.on('error', function (err) {
    console.log('oh no! ' + err.message);
});

arecord.pipe(transcode).pipe(aplay);

//arecord.pipe(pass);
//command.input(pass, { end: true }).output('outfile.flac').run();
//pass.pipe(aplay);
