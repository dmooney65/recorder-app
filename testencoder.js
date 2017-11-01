var mic = require('mic');
var fs = require('fs');
const path = require('path');
const flac = require('flac-bindings');
var wav = require('wav');

var micInstance = mic({
    rate: '48000',
    channels: '2',
    bitwidth: 24,
    exitOnSilence: 6,
    device: 'pulse'
});
var micInputStream = micInstance.getAudioStream();
var wavWriter = new wav.Writer({
    channels: 2,          // 2 channels
    bitDepth: 24,         // 16-bit samples
    sampleRate: 48000     // 44,100 Hz sample rate
});

var outputFileStream = fs.WriteStream(path.join(__dirname, '/output.wav'));
//var flacFileStream = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 24, file: path.join(__dirname, '/out.flac') });

micInputStream.pipe(wavWriter).pipe(outputFileStream);
//micInputStream.pipe(flacFileStream);

micInputStream.on('startComplete', function () {
    console.log('Got SIGNAL startComplete');
    setTimeout(function () {
        micInstance.stop();
    }, 5000);
});


micInstance.start();

