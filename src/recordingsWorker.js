const path = require('path');
const flac = require('flac-bindings');
const fs = require('fs');

var header = require('waveheader');

var recordingsPath = process.argv[2];

var settings = JSON.parse(process.argv[3]);
//console.log(settings);

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

let fileWriter;


if (settings.highResFormat == 'wav') {
    //console.log('recording wav');
    fileWriter = fs.createWriteStream(path.join(recordingsPath, getDateStr() + '_rec.wav'));
    fileWriter.on('finish', function() {
        //console.log('file written');
    });
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

process.on('message', (msg) =>{
    console.log(msg);
    fileWriter.end();
});

process.stdin.pipe(fileWriter);

