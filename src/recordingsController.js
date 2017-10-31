const fs = require('fs');
var mi = require('mediainfo-wrapper');


module.exports.readFiles = (dir) => {

    return mi({ maxBuffer: 5000 * 1024, cwd: dir }, '**/*.{flac, mp3, ogg, aac}').then(function (data) {
        var ret = [];
        for (var i in data) {
            var fullPath = dir + data[i].file;
            var fileName = fullPath.split('\\').pop().split('/').pop();
            var filePath = fullPath.replace(fileName, '');
            ret.push({
                'path': filePath, 'file': fileName,
                'duration': data[i].audio[0].duration[4].substr(0, 8),
                'fileSize': data[i].audio[0].stream_size[4],
                'bitRate': data[i].audio[0].bit_depth[0] + '/'
                + data[i].audio[0].sampling_rate[0] / 1000
            });
            //console.log(data[i].audio[0]);
            //console.log('MediaInfo data:', data[i].audio[0].sampling_rate[0] / 1000);
            //console.log('MediaInfo data:', data[i].audio[0].bit_depth[0]);
        }
        //console.log(ret);
        return (ret);
    }).catch(function (e) { return e; });
};


module.exports.deleteFile = (file) => {
    fs.unlinkSync(file);
};

module.exports.encodeFile = (file) => {
    //fs.unlinkSync(file);
};
