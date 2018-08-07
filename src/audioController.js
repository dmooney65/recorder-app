const path = require('path');
const { spawn } = require('child_process');
const settingsController = require('./settingsController.js')();
const mediaPath = require('./usbController.js');
const ClipDetect = require('./ClipDetect.js');
const { PassThrough } = require('stream');
const passThrough = new PassThrough();
const wssServer = require('../wssServer.js');
let recording = false;
let playing = false;
let recPath = mediaPath.getRecordingPath();

module.exports.Player = () => {

    let play = () => {
        let settings = settingsController.getAll();
        console.log('arecord ', '-f', settings.bitFormat, '-c', 2,
            '-r', settings.sampleRate, '-D', settings.captureDevice);
        this.arecord = spawn(
            'arecord', ['-f', settings.bitFormat, '-c', 2,
                '-r', settings.sampleRate, '-D', settings.captureDevice]
        );

        this.arecord.on('close', (code, signal) => {
            console.log(
                `record process closed due to receipt of signal ${signal}`);
            if (code == 1) {
                console.log(`record process closed with error code ${code}`);
                playing = false;
                broadcastStatus();
            }
        });

        this.arecord.on('error', (err) => {
            console.log('record failed to start ',err);
        });

        /*this.arecord.on('exit', (code, signal) => {
            console.log(
                `record exit thrown ${signal}`);
            if (code == 0) {
                console.log(`record exited with code ${code}`);
            }
            //broadcastStatus();
        });*/

        this.transform = ClipDetect({ inputBitDepth: settings.bitFormat.replace(/\D/g, '') });
        passThrough.on('data', (chunk) => {
            if (chunk.toString() == 'true') {
                wss.broadcast(JSON.stringify({ clipping: true }));
                if (settings.audioCard == 'audioinjector') {
                    global.buttonLedWorker.send({ command: 'blinkLed', arg: 500 });
                }
            }
        });
        this.arecord.stdout.pipe(this.transform, { end: false }).pipe(passThrough, { end: false });


        console.log('aplay ', '-D', settings.playbackDevice);
        this.aplay = spawn('aplay', ['--disable-resample','-D', settings.playbackDevice]);

        this.aplay.on('close', (code, signal) => {
            console.log(
                `play  process terminated due to receipt of signal ${signal} code ${code}`);
        });

        this.arecord.stdout.pipe(this.aplay.stdin);
        playing = true;
        broadcastStatus();
    };

    let stop = () => {
        //this.arecord.pause();
        if (recording) {
            stopRecord();
        }

        this.arecord.stdout.unpipe(this.aplay);
        this.arecord.kill('SIGHUP');

        playing = false;
        broadcastStatus();
    };

    let startRecord = () => {
        var args = [path.join(__dirname, '/recordingsWorker.js'), recPath, JSON.stringify(settingsController.getAll())];
        this.recordingsWorker = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });

        this.arecord.stdout.pipe(this.recordingsWorker.stdin);
        recording = true;
        broadcastStatus();
    };


    let stopRecord = () => {
        this.arecord.stdout.unpipe(this.recordingsWorker.stdin);
        this.recordingsWorker.send('end');
        recording = false;
        broadcastStatus();
    };

    let setRecordingsPath = (path) => {
        recPath = path;
        broadcastStatus();
    };

    let wss = wssServer.WebsocketServer().get();
    wss.on('connection', function connection(client) {
        //console.log('connection');
        client.on('message', function incoming(msg) {
            if (msg == 'play') {
                play();
            } else if (msg == 'stop') {
                stop();
            } else if (msg == 'startRecord' && !recording) {
                startRecord();
            } else if (msg == 'stopRecord' && recording) {
                stopRecord();
            } else if (msg == 'getStatus') {
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
        wss.broadcast(getStatus());
    };

    let getStatus = () => {
        return JSON.stringify({ 'playing': playing, 'recording': recording, 'recordingsPath': recPath });
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
