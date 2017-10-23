const path = require('path');
const flac = require('flac-bindings');
const execStream = require('exec-stream');
var devnull = require('dev-null')();





module.exports = () => {

    var recording = false;

    let play = () => {
        if (!this.arecord) {
            this.arecord = execStream('arecord', ['-f', 'S16_LE', '-c', '2', '-r', '48000']);
            this.aplay = execStream('aplay', []);
        } else {
            this.arecord.unpipe(devnull);
        }
        this.arecord.pipe(this.aplay);
    };

    let stop = () => {
        //this.arecord.pause();
        this.arecord.unpipe(this.aplay);
        this.arecord.pipe(devnull);
        if(recording){
            stopRecord();
        }
        //this.arecord.end();
        //this.aplay.end();
        //this.aplay = null;
        //this.arecord = null;
        //aplay.stop();
    };

    let pause = () => {
        this.arecord.pause();
        //aplay.stop();
    };

    let startRecord = () => {
        console.log('recording to '+__dirname);
        this.fileWriter = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, file: path.join(__dirname, '/out.flac') });        
        this.arecord.pipe(this.fileWriter);
        recording = true;
    };

    let stopRecord = () => {
        //var fileWriter = new flac.FileEncoder({ samplerate: 48000, bitsPerSample: 16, compression: 6, file: path.join(__dirname, '/out.flac') });        
        this.arecord.unpipe(this.fileWriter);
        this.fileWriter.end();
        recording = false;        
    };



    return {
        play: play,
        pause: pause,
        stop: stop,
        startRecord: startRecord,
        stopRecord: stopRecord
    };
};

