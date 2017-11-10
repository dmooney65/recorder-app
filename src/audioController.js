const path = require('path');
const flac = require('flac-bindings');
//const execStream = require('exec-stream');
const { spawn } = require('child_process');
const audioServer = require('./audio/audioServer.js');
const settings = require('./settingsController.js')();
const mp = require('./usbController.js');

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
    var server;
    //var filePath = mp.getRecordingPath();

    /*setInterval(function () {
        filePath = mp.getRecordingPath();
        console.log(filePath);
    }, 5000);*/

    function toArrayBuffer(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    let play = () => {
        //if (!this.arecord) {
        console.log('arecord ', '-f', settings.get('bitFormat'), '-c', 2,
            '-r', settings.get('sampleRate'), '-t', 'wav','-D', settings.get('defaultCard'));
        this.arecord = spawn(
            'arecord', ['-f', settings.get('bitFormat'), '-c', 2,
                '-r', settings.get('sampleRate'), '-t', 'wav', '-D', settings.get('defaultCard')]
        );

        /*this.arecord.stdout.on('data', (data) =>{
            for(var i=0;i < data.length; i++){
                console.log(data[i]);
            }
            //console.log(data);
        });*/

        this.arecord.on('close', (code, signal) => {
            console.log(
                `child process terminated due to receipt of signal ${signal}`);
        });

        this.aplay = spawn('aplay', ['-D', 'plug:default']);
        
        this.arecord.stdout.pipe(this.aplay.stdin);
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
        this.arecord.stdout.unpipe(this.aplay);
        //this.arecord.pipe(devnull);
        this.arecord.kill('SIGHUP');
        //var kill = execStream('killall', ['arecord']);
        //kill.end();
        //this.aplay.end();
        playing = false;
        return getStatus();
    };

    let startRecord = () => {
        var recPath = mp.getRecordingPath();
        var args = [ path.join(__dirname,'/audioWorker.js'), recPath, JSON.stringify(settings.getAll()) ];
        this.child = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });
        /*this.fileWriter = new flac.FileEncoder({
            samplerate: settings.get('sampleRate'), bitsPerSample: settings.get('bitDepth'), inputAs32: settings.get('inputAs32'),
            compressionLevel: settings.get('compressionLevel'),
            file: path.join(mp.getRecordingPath(), getDateStr() + '_rec.flac')
        });
        this.arecord.stdout.pipe(this.fileWriter);*/
        this.arecord.stdout.pipe(this.child.stdin);
        recording = true;
        return getStatus();
    };


    let stopRecord = () => {
        //console.log('stopping recording');
        //this.arecord.stdout.unpipe(this.fileWriter);
        //this.fileWriter.end();
        this.child.send('end writes');
        this.arecord.stdout.unpipe(this.child.stdin);
        //this.child.detach
        recording = false;
        return getStatus();
    };

    let startServer = () => {
        this.streamWriter = new flac.StreamEncoder({
            samplerate: settings.get('sampleRate'), bitsPerSample: settings.get('bitDepth'), inputAs32: settings.get('inputAs32'),
            compressionLevel: 9
        });
        server = audioServer.Server(3080, this.streamWriter, settings.get('sampleRate'));
        server.start();
        //this.arecord.unpipe(this.aplay);
        this.arecord.stdout.pipe(this.streamWriter);
        serving = server.listening();
        return getStatus();
    };

    let stopServer = () => {
        this.arecord.stdout.unpipe(this.streamWriter);
        //this.arecord.pipe(this.aplay);
        server.stop();
        serving = false;
        return getStatus();
    };

    let getServing = () => {
        if (server) {
            serving = server.listening();
            return serving;
        } else {
            return false;
        }
    };

    let getStatus = () => {
        return ({ 'playing': playing, 'recording': recording, 'serving': getServing(), 'recordingsPath': mp.getRecordingPath() });
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

