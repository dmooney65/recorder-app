var fs = require('fs');
const path = require('path');
const flac = require('flac-bindings');
var wav = require('wav');

var file = fs.createReadStream(path.join(__dirname, '/stravinsky.wav'));
var reader = new wav.Reader({
    channels: 2,          // 2 channels
    bitDepth: 16,         // 16-bit samples
    sampleRate: 44100     // 44,100 Hz sample rate
});

var flacFileStreamDefault = new flac.FileEncoder({ samplerate: 44100, bitsPerSample: 16, file: path.join(__dirname, '/stravinskyCompDefault.flac') });
var flacFileStream0 = new flac.FileEncoder({ samplerate: 44100, bitsPerSample: 16, compressionLevel: 0, file: path.join(__dirname, '/stravinskyComp0.flac') });
var flacFileStream5 = new flac.FileEncoder({ samplerate: 44100, bitsPerSample: 16, compressionLevel: 6, file: path.join(__dirname, '/stravinskyComp6.flac') });
// the "format" event gets emitted at the end of the WAVE header
//reader.on('format', function (format) {

// the WAVE header is stripped from the output of the reader
reader.pipe(flacFileStreamDefault);
reader.pipe(flacFileStream0);
reader.pipe(flacFileStream5);

//});

// pipe the WAVE file to the Reader instance
file.pipe(reader);


