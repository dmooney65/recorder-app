
const flac = require('flac-bindings');

//var fs = require('fs');

//var out = fs.createWriteStream('./out.wav');

var fileWriter = new flac.FileEncoder({
    samplerate: 48000, bitsPerSample: 16, inputAs32: false,
    compressionLevel: 5,
    file: './child_rec.flac'
});
//console.log(fileWriter);
process.stdin.pipe(fileWriter);

/*process.write = function (buf) {
    console.log('write',buf);
    //process.stdout(buf);
};*/

//process.end = function (buf) {
//    console.log('end');    
    //process.write(buf);
//};