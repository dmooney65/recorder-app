
const flac = require('flac-bindings');
var fs = require('fs');
const { spawn } = require('child_process');

var out = fs.createWriteStream('./out.wav');

//var out1 = fs.createWriteStream('./out1.wav');

/*var fileWriter = new flac.FileEncoder({
    samplerate: 48000, bitsPerSample: 24, inputAs32: false,
    compressionLevel: 5,
    file: './child_rec.flac'
});*/


//console.log(fileWriter);
//process.stdin.pipe(fileWriter);
//process.stdin.pipe(wv).pipe(out);


/*process.write = function (buf) {
    console.log('write',buf);
    //process.stdout(buf);
};*/

//process.end = function (buf) {
//    console.log('end');    
//    process.write(buf);
//};