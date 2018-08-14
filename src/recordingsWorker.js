const path = require('path');
const flac = require('flac-bindings');
const fs = require('fs');
const header = require('./waveheader.js');

const recordingsPath = process.argv[2];
const settings = JSON.parse(process.argv[3]);

const formatField = (val) => {
    return (0 + val.toString()).slice(-2);
};

const getDateStr = () => {
    let date = new Date();
    let y = date.getFullYear().toString();
    let m = formatField(date.getMonth() + 1);
    let d = formatField(date.getDate());
    let hh = formatField(date.getHours());
    let mm = formatField(date.getMinutes());
    let ss = formatField(date.getSeconds());
    return y + m + d + hh + mm + ss;
};

let fileWriter;

if (settings.highResFormat == 'wav') {
    fileWriter = fs.createWriteStream(path.join(recordingsPath, getDateStr() + '_rec.wav'));

    fileWriter.write(header(0, {
        bitDepth: settings.bitFormat.replace(/\D/g, ''),
        sampleRate: settings.sampleRate,
        channels: 2
    }));

} else {
    fileWriter = new flac.FileEncoder({
        samplerate: settings.sampleRate, bitsPerSample: settings.bitFormat.replace(/\D/g, ''),
        compressionLevel: settings.compressionLevel,
        file: path.join(recordingsPath, getDateStr() + '_rec.flac')
    });
}

fileWriter.on('close', () => {
    console.log('close called');
});

fileWriter.on('error', (err) => {
    console.log('error called=', err);
});

fileWriter.on('unpipe', () => {
    console.error('Something has stopped piping into the writer.');
    //assert.equal(src, reader);
});

process.on('message', () => {
    fileWriter.end(() => {
        process.disconnect();
        process.exit(0);
    });
});

process.stdin.pipe(fileWriter);

