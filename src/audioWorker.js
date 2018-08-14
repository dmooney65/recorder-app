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

    console.log('arecord ', '-t', 'raw', '-f', settings.bitFormat, '-c', 2,
        '-r', settings.sampleRate, '-D', settings.captureDevice);
    this.arecord = spawn(
        'arecord', ['-t', 'raw', '-f', settings.bitFormat, '-c', 2,
            '-r', settings.sampleRate, '-D', settings.captureDevice, '--max-file-time', '216000']
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

    this.transform = ClipDetect({ inputBitDepth: settings.bitFormat.replace(/\D/g, '') });

    this.arecord.stdout.pipe(this.transform, { end: false }).pipe(passThrough, { end: false });


    console.log('aplay ', '-f', settings.bitFormat, '-c', 2,
        '-r', settings.sampleRate, '-D', settings.playbackDevice);
    this.aplay = spawn('aplay', ['-f', settings.bitFormat, '-c', 2,
        '-r', settings.sampleRate, '-D', settings.playbackDevice]);

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
    var args = [path.join(__dirname, '/recordingsWorker.js'), recPath, JSON.stringify(settings)];
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

process.on('SIGINT', function () {
    console.log('\nGot SIGINT (Ctrl-C)');
    // Cleanup activities go here...
    process.disconnect();
    // Then shutdown.
    process.exit(0);
});

let broadcastStatus = () => {
    process.send(getStatus());
};

let getStatus = () => {
    return { 'playing': playing, 'recording': recording, 'recordingsPath': recPath };
};

