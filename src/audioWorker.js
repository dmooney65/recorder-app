const path = require('path');
const { spawn } = require('child_process');
const ClipDetect = require('./ClipDetect.js');
const { PassThrough } = require('stream');
const passThrough = new PassThrough();
let recording = false;
let playing = false;
let recPath;
let settings;


passThrough.on('data', (chunk) => {
    if (chunk.toString() == 'true') {
        process.send({ clipping: true });
    }
});

let play = () => {

    this.arecord = spawn(
        'arecord', ['-v', '-t', 'raw', '-f', settings.bitFormat, '-c', 2,
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
        console.log('record failed to start ', err);
    });

    /*this.arecord.on('exit', (code, signal) => {
        console.log(
            `record exit thrown ${signal}`);
        if (code == 0) {
            console.log(`record exited with code ${code}`);
        }
        //broadcastStatus();
    });*/

    this.arecord.stderr.pipe(process.stdout);

    this.transform = ClipDetect({ inputBitDepth: settings.bitFormat.replace(/\D/g, '') });

    this.arecord.stdout.pipe(this.transform, { end: false }).pipe(passThrough, { end: false });


    this.aplay = spawn('aplay', ['-f', settings.bitFormat, '-c', 2,
        '-r', settings.sampleRate, '-D', settings.playbackDevice]);

    this.aplay.stderr.pipe(process.stdout);
    this.aplay.on('close', (code, signal) => {
        console.log(
            `play  process terminated due to receipt of signal ${signal} code ${code}`);
    });

    this.arecord.stdout.pipe(this.aplay.stdin);
    playing = true;
    broadcastStatus();
};

let stop = () => {
    if (recording) {
        stopRecord();
    }

    this.arecord.stdout.unpipe(this.aplay);
    this.arecord.kill('SIGHUP');

    playing = false;
    broadcastStatus();
};

let startRecord = () => {
    if (playing) {
        var args = [path.join(__dirname, '/recordingsWorker.js'), recPath, JSON.stringify(settings)];
        this.recordingsWorker = spawn(process.execPath, args, { stdio: ['pipe', 1, 2, 'ipc'] });

        this.arecord.stdout.pipe(this.recordingsWorker.stdin);
        recording = true;
    }
    broadcastStatus();
};


let stopRecord = () => {
    if (recording) {
        this.arecord.stdout.unpipe(this.recordingsWorker.stdin);
        this.recordingsWorker.send('end');
        recording = false;
    }
    broadcastStatus();
};

let setRecordingsPath = (path) => {
    recPath = path;
    broadcastStatus();
};

process.on('message', (msg) => {
    switch (msg.command) {
        case 'settings':
            settings = msg.arg;
            break;
        case 'getStatus':
            broadcastStatus();
            break;
        case 'play':
            play();
            break;
        case 'stop':
            stop();
            break;
        case 'startRecord':
            startRecord();
            break;
        case 'stopRecord':
            stopRecord();
            break;
        case 'setRecordingsPath':
            setRecordingsPath(msg.arg);
            break;
    }

});

process.on('SIGINT', () => {
    console.log('\nGot SIGINT (Ctrl-C)');
    if (playing) {
        stop();
    }
    process.disconnect();
    process.exit(0);
});

let broadcastStatus = () => {
    process.send(getStatus());
};

let getStatus = () => {
    return { 'playing': playing, 'recording': recording, 'recordingsPath': recPath };
};

