var Sound = require('node-arecord');

var sound = new Sound({
 debug: true,    // Show stdout
 destination_folder: './',
 filename: 'filename.wav',
 alsa_format: 'dat',
 alsa_device: 'plughw:0,2'
});

sound.record();

setTimeout(function () {
	sound.pause(); // pause the recording after five seconds
}, 5000);

setTimeout(function () {
	sound.resume(); // and resume it two seconds after pausing
}, 7000);

setTimeout(function () {
	sound.stop(); // stop after ten seconds
}, 10000);

// you can also listen for various callbacks:
sound.on('complete', function () {
	console.log('Done with recording!');
});