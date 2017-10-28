const path = require('path');
const flac = require('flac-bindings');

var file = path.join(__dirname, '/Coyote.flac');
var reader = new flac.FileDecoder({
    channels: 2,          // 2 channels
    bitsPerSample: 24,         // 16-bit samples
    samplerate: 192000,     // 44,100 Hz sample rate
    file: file
});

var flacFileStreamDefault = new flac.FileEncoder({ samplerate: 192000, bitsPerSample: 24, file: path.join(__dirname, '/coyotereenc.flac') });
// the "format" event gets emitted at the end of the WAVE header
//reader.on('format', function (format) {

// the WAVE header is stripped from the output of the reader
reader.pipe(flacFileStreamDefault);
