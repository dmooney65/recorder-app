const path = require('path');
var fs = require('fs');
//const flac = require('flac-bindings');
const execStream = require('exec-stream');
var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();
var command1 = ffmpeg();
const { PassThrough } = require('stream');
const pass = new PassThrough();


var stream  = fs.createWriteStream('outputfile.flac');
//var flacFileStream = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, inputAs32: false, file: path.join(__dirname, '/out.flac') });

var arecord = execStream(
    'arecord', ['-f', 'S32_LE', '-c', 2,
        '-r', 192000, '-D', 'hw:0,0']
);
var aplay = execStream('aplay', ['-D', 'plug:default']);
//} else {
//    this.arecord.unpipe(devnull);
//}

//var command = ffmpeg({ source: arecord});
//command.input(arecord).format('wav').output(aplay).run();
//arecord.pipe(aplay);
//var pass = new stream.PassThrough();
arecord.pipe(aplay);
arecord.pipe(pass);
command1.input(pass).output('outfile.flac').run();
//pass.pipe(aplay);
