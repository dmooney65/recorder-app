const fs = require('fs');
var mediaInfo = require('mediainfo-wrapper');
const { spawn } = require('child_process');
const settingsController = require('./settingsController.js');

module.exports.readFiles = (dir) => {

    return mediaInfo({ maxBuffer: 5000 * 1024, cwd: dir }, '**/*.flac', '**/*.wav', '**/*.mp3').then(function (data) {
        var ret = [];
        for (var i in data) {
            var fullPath = dir + data[i].file;
            var fileName = fullPath.split('\\').pop().split('/').pop();
            var filePath = fullPath.replace(fileName, '');

            var item = {
                'path': filePath, 'file': fileName
            };

            try {
                item.duration = data[i].audio[0].duration[4].substr(0, 8);
                item.fileSize = data[i].audio[0].stream_size[4];

                if (fileName.indexOf('mp3') > 0) {
                    item.bitRate = '16/' + data[i].audio[0].sampling_rate[0] / 1000;
                } else {
                    item.bitRate = data[i].audio[0].bit_depth[0] + '/'
                        + data[i].audio[0].sampling_rate[0] / 1000;
                }
            } catch (e) {
                //swallow minor errors at the file level
                //console.log(e);
            }

            ret.push(item);

        }
        return (ret);
    }).catch(function () { //console.log(e); 
        return [];
    });
};


module.exports.deleteFile = (file) => {
    fs.unlinkSync(file);
};


module.exports.encodeFile = (file) => {

    settingsController.get().then(function (settings) {
        var transcode;
        if (file.indexOf('wav') > 0) {
            transcode = spawn(
                'ffmpeg', ['-i', file, '-codec:a', 'flac',
                    '-compression_level', settings.compressionLevel, file.replace('.wav', '.flac')]
            );
        } else {
            transcode = spawn(
                'ffmpeg', ['-i', file, '-codec:a', 'libmp3lame',
                    '-qscale:a', settings.mp3Rate, file.replace('.flac', '.mp3')]
            );
        }

        transcode.on('close', (code) => {
            console.log(`transcode child process exited with code ${code}`);
        });
    });

};
