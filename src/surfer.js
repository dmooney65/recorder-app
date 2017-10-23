
var WaveSurfer = require('wavesurfer');

var wavesurfer = WaveSurfer.create({
    container: '#waveform'
});

wavesurfer.load('recordings/stones.flac');

wavesurfer.on('ready', function () {
    wavesurfer.play();
});
