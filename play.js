
var	spawn = require('child_process').spawn,
const Speaker = require('speaker');

// Create the Speaker instance
const speaker = new Speaker({
 channels: 2,          // 2 channels
 bitDepth: 16,         // 16-bit samples
 sampleRate: 44100     // 44,100 Hz sample rate
});

mic.startCapture();

mic.audioStream.on('data', function(data) {
    speaker.write(data);
});