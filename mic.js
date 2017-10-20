var mic = require('mic');
var fs = require('fs');
var flac = require('flac-bindings');
const path = require('path');
var Speaker = require('speaker');
// Create the Speaker instance

var speaker = new Speaker({
 channels: 2,          // 2 channels
 bitDepth: 16,         // 16-bit samples
 sampleRate: 44100     // 44,100 Hz sample rate
});

var libao = require('libao');

// Create the libao instance
var ao = new libao({
  channels: 2,          // 2 channels
  bitDepth: 16,         // 16-bit samples
  sampleRate: 44100     // 44,100 Hz sample rate
});


var micInstance = mic({
    rate: '44100',
    channels: '2',
    bitwidth: 16,
    //debug: true,
    device: 'plughw:pisound,0',
    exitOnSilence: 6
});


var micInputStream = micInstance.getAudioStream();
 
var outputFile = new flac.FileEncoder({ samplerate: 44100, bitsPerSample:16, file: path.normalize('/home/pi/Music/output.flac')});
 
//micInputStream.pipe(speaker);
micInputStream.pipe(outputFile);
 
micInputStream.on('data', function(data) {
    //console.log("Recieved Input Stream: " + data.length);
});
 
micInputStream.on('error', function(err) {
    cosole.log("Error in Input Stream: " + err);
});
 
micInputStream.on('startComplete', function() {
    console.log("Got SIGNAL startComplete");
    setTimeout(function() {
            micInstance.pause();
    }, 5000);
});
    
micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
});
    
micInputStream.on('pauseComplete', function() {
    console.log("Got SIGNAL pauseComplete");
    setTimeout(function() {
        micInstance.resume();
    }, 5000);
});
 
micInputStream.on('resumeComplete', function() {
    console.log("Got SIGNAL resumeComplete");
    setTimeout(function() {
        micInstance.stop();
    }, 15000);
});
 
micInputStream.on('silence', function() {
    console.log("Got SIGNAL silence");
});
 
micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
});
 
micInstance.start();
