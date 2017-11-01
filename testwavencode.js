var fs = require('fs');
const path = require('path');
const flac = require('flac-bindings');

var file = fs.createReadStream(path.join(__dirname, '/test.wav'));

var flacFileStreamDefault = new flac.FileEncoder({ samplerate: 192000, bitsPerSample: 24, inputAs32: false, file: path.join(__dirname, '/testbindings.flac') });
// the "format" event gets emitted at the end of the WAVE header
//reader.on('format', function (format) {

// the WAVE header is stripped from the output of the reader
file.pipe(flacFileStreamDefault);


//});

// pipe the WAVE file to the Reader instance



