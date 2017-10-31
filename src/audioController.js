const path = require('path');
const flac = require('flac-bindings');
const execStream = require('exec-stream');
const devnull = require('dev-null')();
const audioServer = require('./audio/audioServer.js');
var settings = require('./settingsController.js')();
var mp = require('./usbController.js');




const formatField = (val) => {
    return (0 + val.toString()).slice(-2);
};

const getDateStr = () => {
    var date = new Date();
    var y = date.getFullYear().toString();
    var m = formatField(date.getMonth() + 1);
    var d = formatField(date.getDate());
    var hh = formatField(date.getHours());
    var mm = formatField(date.getMinutes());
    var ss = formatField(date.getSeconds());
    return y + m + d + hh + mm + ss;
};


module.exports.Player = () => {

    var recording = false;
    var serving = false;
    var playing = false;
    //var filePath = mp.getRecordingPath();

    /*setInterval(function () {
        filePath = mp.getRecordingPath();
        console.log(filePath);
    }, 5000);*/

    let play = () => {
        //if (!this.arecord) {
        this.arecord = execStream(
            'arecord', ['-f', 'S' + settings.get('bitDepth') + '_LE', '-c', 2,
                '-r', settings.get('sampleRate'), '-D', 'plug:default']
        );
        this.aplay = execStream('aplay', ['-D', 'plug:default']);
        //} else {
        //    this.arecord.unpipe(devnull);
        //}
        this.arecord.pipe(this.aplay);
        playing = true;
        return getStatus();
    };

    let stop = () => {
        //this.arecord.pause();
        if (recording) {
            stopRecord();
        }
        if (serving) {
            stopServer();
        }
        this.arecord.unpipe(this.aplay);
        //this.arecord.pipe(devnull);
        this.arecord.end();
        var kill = execStream('killall', ['arecord']);
        kill.end();
        this.aplay.end();
        playing = false;
        return getStatus();
    };

    let startRecord = () => {
        this.fileWriter = new flac.FileEncoder({
            samplerate: settings.get('sampleRate'), bitsPerSample: settings.get('bitDepth'),
            compressionLevel: settings.get('compressionLevel'),
            file: path.join(mp.getRecordingPath(), getDateStr() + '_rec.flac')
        });
        this.arecord.pipe(this.fileWriter);
        recording = true;
        return getStatus();
    };


    let stopRecord = () => {
        //console.log('stopping recording');
        this.arecord.unpipe(this.fileWriter);
        this.fileWriter.end();
        recording = false;
        return getStatus();
    };

    let startServer = () => {
        this.streamWriter = new flac.StreamEncoder({
            samplerate: settings.get('sampleRate'), bitsPerSample: settings.get('bitDepth'),
            compressionLevel: settings.get('compressionLevel')
        });
        this.server = audioServer.Server(3080, this.streamWriter, settings.get('sampleRate'));
        this.server.start();
        //this.arecord.unpipe(this.aplay);
        this.arecord.pipe(this.streamWriter);
        serving = true;
        return getStatus();
    };

    let stopServer = () => {
        this.arecord.unpipe(this.streamWriter);
        //this.arecord.pipe(this.aplay);
        this.server.stop();
        serving = false;
        return getStatus();
    };

    let getStatus = () => {
        return ({ 'playing': playing, 'recording': recording, 'serving': serving , 'recordingsPath': mp.getRecordingPath()});
    };

    return {
        play: play,
        stop: stop,
        startRecord: startRecord,
        stopRecord: stopRecord,
        startServer: startServer,
        stopServer: stopServer,
        getStatus: getStatus,
    };
};

