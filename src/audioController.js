const path = require('path');
const { spawn } = require('child_process');
const settingsController = require('./settingsController.js')();
const mediaPath = require('./usbController.js');
const ClipDetect = require('./ClipDetect.js');
const { PassThrough } = require('stream');
const pass = new PassThrough();

this.recording = false;
this.playing = false;
this.recPath = mediaPath.getRecordingPath();

module.exports.Player = () => {

    let play = () => {
        let settings = settingsController.getAll();
        console.log('arecord ', '-f', settings.bitFormat, '-c', 2,
            '-r', settings.sampleRate, '-D', settings.defaultCard);
        this.arecord = spawn(
            'arecord', ['-f', settings.bitFormat, '-c', 2,
                '-r', settings.sampleRate, '-D', settings.defaultCard]
        );

        this.arecord.on('close', (code, signal) => {
            console.log(
                `record process terminated due to receipt of signal ${signal}`);
        });

        this.arecord.on('error', (code, signal) => {
            console.log(
                `record error thrown ${signal}`);
        });

        this.arecord.on('exit', (code, signal) => {
            console.log(
                `record exit thrown ${signal}`);
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

        this.aplay.on('close', (code, signal) => {
            console.log(
                `play  process terminated due to receipt of signal ${signal}`);
        });

        this.aplay.on('error', (code, signal) => {
            console.log(
                `play error thrown ${signal}`);
        });

        this.aplay.on('exit', (code, signal) => {
            console.log(
                `play exit thrown ${signal}`);
        });


        this.arecord.stdout.pipe(this.aplay.stdin);
        this.playing = true;
        broadcastStatus();
    };

    let stop = () => {
        //this.arecord.pause();
        if (this.recording) {
            stopRecord();
        }

        this.arecord.stdout.unpipe(this.aplay);
        this.arecord.kill('SIGHUP');

        this.playing = false;
        broadcastStatus();
    };

    let startRecord = () => {
        var args = [path.join(__dirname, '/recordingsWorker.js'), this.recPath, JSON.stringify(settingsController.getAll())];
        this.recordingsWorker = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });

        this.arecord.stdout.pipe(this.recordingsWorker.stdin);
        this.recording = true;
        broadcastStatus();
    };


    let stopRecord = () => {
        this.arecord.stdout.unpipe(this.recordingsWorker.stdin);
        this.recordingsWorker.send('end');
        this.recording = false;
        broadcastStatus();
    };

    let setRecordingsPath = (path) => {
        this.recPath = path;
        broadcastStatus();
    };

    global.wss.on('connection', function connection(client) {
        //console.log('connection');
        //broadcastStatus();
        client.on('message', function incoming(msg) {
            if(msg == 'play'){
                play();
            } else if (msg == 'stop'){
                stop();
            } else if (msg == 'startRecord' && !this.recording){
                startRecord();
            } else if (msg == 'stopRecord' && this.recording){
                stopRecord();
            } else if (msg == 'getStatus'){
                broadcastStatus();
            }
            //console.log('message',msg);
        });
        client.on('error', () => {
            console.log('client error');
        });
    });

    let broadcastStatus = () => {
        //console.log('broadcasting');
        global.wss.broadcast(getStatus());
    };

    let getStatus = () => {
        return JSON.stringify({ 'playing': this.playing, 'recording': this.recording, 'recordingsPath': this.recPath });
    };

    return {
        play: play,
        stop: stop,
        startRecord: startRecord,
        stopRecord: stopRecord,
        getStatus: getStatus,
        setRecordingsPath: setRecordingsPath
    };
};
