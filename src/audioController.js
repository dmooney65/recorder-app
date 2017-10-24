const path = require('path');
const flac = require('flac-bindings');
const execStream = require('exec-stream');
const devnull = require('dev-null')();
const audioServer = require('./audio/audioServer.js');





module.exports = () => {

    var recording = false;
    var serving = false;
    var playing = false;
    

    let play = () => {
        if (!this.arecord) {
            this.arecord = execStream('arecord', ['-f', 'S16_LE', '-c', '2', '-r', '48000']);
            this.aplay = execStream('aplay', []);
        } else {
            this.arecord.unpipe(devnull);
        }
        this.arecord.pipe(this.aplay);
        playing = true;
        return getStatus();        
    };

    let stop = () => {
        //this.arecord.pause();
        this.arecord.unpipe(this.aplay);
        this.arecord.pipe(devnull);
        if(recording){
            stopRecord();
        }
        if(serving){
            stopServer();
        }
        playing = false;
        return getStatus();        
    };

    let startRecord = () => {
        console.log('recording to '+__dirname);
        this.fileWriter = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, file: path.join(__dirname, '/out.flac') });        
        this.arecord.pipe(this.fileWriter);
        recording = true;
        return getStatus();        
    };

    let stopRecord = () => {
        console.log('stopping recording');
        //var fileWriter = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, compression: 6, file: path.join(__dirname, '/out.flac') });        
        this.arecord.unpipe(this.fileWriter);
        this.fileWriter.end();
        recording = false;
        return getStatus();        
    };

    let startServer = () => {
        this.streamWriter = new flac.StreamEncoder({ samplerate: 48000, bitsPerSample: 16, compressionLevel: 0 });
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
        return ({'playing': playing, 'recording': recording, 'serving': serving});
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

