const fs = require('fs');
var mi = require('mediainfo-wrapper');
const execStream = require('exec-stream');

module.exports.readFiles = (dir) => {

    return mi({ maxBuffer: 5000 * 1024, cwd: dir }, '**/*.flac', '**/*.mp3').then(function (data) {
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
                console.log(e);
            }

            ret.push(item);

        }
        return (ret);
    }).catch(function (e) { return e; });
};


module.exports.deleteFile = (file) => {
    fs.unlinkSync(file);
};

module.exports.encodeFile = (file) => {
    this.transcode = execStream(
        'ffmpeg', ['-i', file, '-codec:a', 'libmp3lame',
            '-qscale:a', '0', file.replace('.flac', '.mp3')]
    );
    //fs.unlinkSync(file);
};
