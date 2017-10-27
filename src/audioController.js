const path = require('path');
const flac = require('flac-bindings');
const execStream = require('exec-stream');
const devnull = require('dev-null')();
const audioServer = require('./audio/audioServer.js');


module.exports.Player = (options) => {

    var recording = false;
    var serving = false;
    var playing = false;
    let defaults = {
        channels: 2,
        bitDepth: 16,
        sampleRate: 44100,
        compressionLevel: 5,
    };
    let opts = Object.assign({}, defaults, options);

    opts.sampleFormat = Number(opts.bitDepth) == 16 ? 'S16_LE' : 'S24_LE';
    console.log(opts.sampleFormat);
    opts.inputAs32 = Number(opts.bitDepth) == 16 ? false : true;
    console.log(opts.inputAs32);


    let play = () => {
        //if (!this.arecord) {
        this.arecord = execStream('arecord', ['-f', opts.sampleFormat, '-c', opts.channels, '-r', opts.sampleRate]);
        this.aplay = execStream('aplay', []);
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
        //console.log('recording to '+__dirname);
        this.fileWriter = new flac.FileEncoder({ samplerate: opts.sampleRate, inputAs32: opts.inputAs32, bitsPerSample: opts.bitDepth, compressionLevel: opts.compressionLevel, file: path.join(__dirname, '/out.flac') });
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
        this.streamWriter = new flac.StreamEncoder({ samplerate: opts.sampleRate, inputAs32: opts.inputAs32, bitsPerSample: opts.bitDepth, compressionLevel: opts.compressionLevel });
        this.server = audioServer.Server(3080, this.streamWriter);
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
        return ({ 'playing': playing, 'recording': recording, 'serving': serving });
    };

    return {
        play: play,
        stop: stop,
        startRecord: startRecord,
        stopRecord: stopRecord,
        startServer: startServer,
        stopServer: stopServer,
        getStatus: getStatus
    };
};

