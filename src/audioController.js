const path = require('path');
const flac = require('flac-bindings');
const { spawn } = require('child_process');
const audioServer = require('./audio/audioServer.js');
const settingsController = require('./settingsController.js')();
const mp = require('./usbController.js');
const ClipDetect = require('./ClipDetect.js');
const { PassThrough } = require('stream');
const pass = new PassThrough();

/*const formatField = (val) => {
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
};*/


module.exports.Player = () => {

    var recording = false;
    var serving = false;
    var playing = false;
    var server;


    let play = () => {
        let settings = settingsController.getAll();
        console.log('arecord ', '-f', settings.bitFormat, '-c', 2,
            '-r', settings.sampleRate, '-D', settings.defaultCard);
        this.arecord = spawn(
            'arecord', ['-f', settings.bitFormat, '-c', 2,
                '-r', settings.sampleRate, '-D', settings.defaultCard]
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

        this.transform = ClipDetect({ inputBitDepth: settings.bitFormat.replace(/\D/g, '') });
        pass.on('data', (chunk) => {
            if (chunk.toString() == 'true') {
                global.wss.broadcast(JSON.stringify({ clipping: true }));
                if (settings.audioCard == 'audioinjector') {
                    global.buttonLedWorker.send({ command: 'blinkLed', arg: 500 });
                }
            }
        });
        this.arecord.stdout.pipe(this.transform, { end: false }).pipe(pass, { end: false });


        this.aplay = spawn('aplay', ['-D', 'default']);

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
        this.arecord.kill('SIGHUP');
        //var kill = execStream('killall', ['arecord']);
        //kill.end();
        //this.aplay.end();
        playing = false;
        return getStatus();
    };

    let startRecord = () => {
        var recPath = mp.getRecordingPath();
        var args = [path.join(__dirname, '/recordingsWorker.js'), recPath, JSON.stringify(settingsController.getAll())];
        this.recordingsWorker = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });
        /*this.fileWriter = new flac.FileEncoder({
            samplerate: settings.get('sampleRate'), bitsPerSample: settings.get('bitDepth'), inputAs32: settings.get('inputAs32'),
            compressionLevel: settings.get('compressionLevel'),
            file: path.join(mp.getRecordingPath(), getDateStr() + '_rec.flac')
        });
        this.arecord.stdout.pipe(this.fileWriter);*/
        this.arecord.stdout.pipe(this.recordingsWorker.stdin);
        recording = true;
        return getStatus();
    };


    let stopRecord = () => {
        //console.log('stopping recording');
        //this.arecord.stdout.unpipe(this.fileWriter);
        //this.fileWriter.end();
        this.arecord.stdout.unpipe(this.recordingsWorker.stdin);
        this.recordingsWorker.send('end');
        recording = false;
        return getStatus();
    };

    let startServer = () => {
        let settings = settingsController.getAll();
        this.streamWriter = new flac.StreamEncoder({
            samplerate: settings.sampleRate, bitsPerSample: settings.bitFormat.replace(/\D/g, ''), inputAs32: settings.inputAs32,
            compressionLevel: 0
        });
        server = audioServer.Server(3080, this.streamWriter, settings.sampleRate);
        server.start();
        this.arecord.stdout.pipe(this.streamWriter, { end: false });
        serving = server.listening();
        return getStatus();
    };

    let stopServer = () => {
        this.arecord.stdout.unpipe(this.streamWriter);
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
        return ({ status: { 'playing': playing, 'recording': recording, 'serving': getServing(), 'recordingsPath': mp.getRecordingPath() } });
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
