const fs = require('fs');
const mediaInfo = require('node-mediainfolib');
const glob = require('glob');
const { fork, spawn } = require('child_process');
const settingsController = require('./settingsController.js');
const path = require("path");


module.exports.readFiles = (dir) => {

    return new Promise((resolve, reject) => {
        glob('**/*.+(flac|wav|mp3)', { cwd: dir, realpath: true, strict: false, silent: true }, (err, data) => {
            if (err) return reject(err);

            var items = []
            var info = mediaInfo.getLocal(data, {
                General: ['Duration/String3', 'FileSize/String'],
                Audio: ['SamplingRate', 'BitDepth']
            });

            for (var i = 0; i < info.length; i++) {
                var file = info[i].File;
                var item = {
                    'path': path.dirname(file) + '/', 'file': path.basename(file)
                };
                if (info[i].General) {
                    if (info[i].General.Duration_String3) {
                        item.duration = info[i].General.Duration_String3.substr(0, 8);
                    }
                    item.fileSize = info[i].General.FileSize_String;
                    if (file.indexOf('mp3') > 0) {
                        item.bitRate = '16/' + info[i].Audio[0].SamplingRate / 1000;
                    } else {
                        item.bitRate = info[i].Audio[0].BitDepth +
                            '/' + info[i].Audio[0].SamplingRate / 1000;

                    }
                }
                items.push(item);
            }
            return resolve(items);
        });
    });
};


module.exports.deleteFile = (file) => {
    fs.unlinkSync(file);
};


module.exports.encodeFile = (file) => {

    settingsController.get().then((settings) => {
        var transcode;
        console.log('Transcoding file: ', file);
        if (file.indexOf('wav') > 0) {
            var args = [file, settings.compressionLevel];
            var transcode = fork(__dirname + '/transcodeWorker.js', args);
        } else {
            transcode = spawn(
                'ffmpeg', ['-i', file, '-codec:a', 'libmp3lame',
                    '-qscale:a', settings.mp3Rate, file.replace('.flac', '.mp3')],
                {
                    stdio: 'ignore'
                }
            );
        }

        transcode.on('close', (code) => {
            console.log(`transcode child process exited with code ${code}`);
        });
    });

};
