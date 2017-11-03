//var fs = require('fs');
const path = require('path');
const flac = require('flac-bindings');
const execStream = require('exec-stream');



var flacFileStream = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, inputAs32: false, file: path.join(__dirname, '/out.flac') });

var arecord = execStream(
    'arecord', ['-f', 'S16_LE', '-c', 2,
        '-r', 48000, '-D', 'hw:0,0']
);
var aplay = execStream('aplay', ['-D', 'plug:default']);
//} else {
//    this.arecord.unpipe(devnull);
//}
arecord.pipe(aplay);
arecord.pipe(flacFileStream);
