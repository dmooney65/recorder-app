const flac = require('flac-bindings');
const fs = require('fs');
const mediaInfo = require('node-mediainfolib');

const file = process.argv[2];
const compressionLevel = process.argv[3];

var info = mediaInfo.getLocal(file, {
    General: ['Duration'],
    Audio: ['SamplingRate', 'BitDepth']
});

let fileReader = fs.createReadStream(file, { autoClose: true })

let fileWriter = new flac.FileEncoder({
    samplerate: info[0].Audio[0].SamplingRate, bitsPerSample: info[0].Audio[0].BitDepth,
    compressionLevel: compressionLevel, file: file.replace('.wav', '.flac')
});

fileReader.on('data', (data) => {
    fileWriter.write(data);
})

fileReader.on('close', () => {
    console.log('transcodeWorker - Encode complete');
    fileWriter.end(() => {
        process.exit(0);
    });
});