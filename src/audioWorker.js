const path = require('path');

const flac = require('flac-bindings');

//var fs = require('fs');

//process.argv.forEach((val, index) => {
//    console.log(`${index}: ${val}`);
//});

var recordingsPath = process.argv[2];

var settings = JSON.parse(process.argv[3]);

//var out = fs.createWriteStream('./out.wav');
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

var fileWriter = new flac.FileEncoder({
    samplerate: settings.sampleRate, bitsPerSample: settings.bitDepth, inputAs32: settings.inputAs32,
    compressionLevel: settings.compressionLevel,
    file: path.join(recordingsPath, getDateStr() + '_rec.flac')
});

//var fs = require('fs');

//var out = fs.createWriteStream('./out.wav');
//console.log(fileWriter);
process.stdin.pipe(fileWriter);

/*let startRecord = () => {
    this.
    this.arecord.stdout.pipe(this.fileWriter);
    recording = true;
    return getStatus();
};*/