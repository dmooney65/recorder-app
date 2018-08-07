var express = require('express');
var router = express.Router();
var files = require('../src/recordingsController');
var os = require('os');
var spawn = require('child_process').spawnSync;


router.get('/', function (req, res) {
    var localResp = files.readFiles(os.homedir() + '/Music/');

    localResp.then(function (localResults) {
        var ls = spawn('ls', ['/media/']);
        var lines = ls.stdout.toString().split('\n');
        var usbResp;
        lines.forEach(line => {
            try {
                usbResp = files.readFiles('/media/' + line.toString() + '/');
            } catch (e) {
                //Errors here are probably permission related so ignore
            }
        });

        usbResp.then(function (usbResults) {
            res.render('recordings', { 'localResults': localResults, 'usbResults': usbResults });
        });
        usbResp.catch(function () {
            console.log('Promise Rejected');
        });
    });

    localResp.catch(function () {
        console.log('Promise Rejected');
    });
});

router.get('/encode', function (req, res) {
    files.encodeFile(req.query.file);
    res.redirect('/recordings');
});

router.get('/delete', function (req, res) {
    files.deleteFile(req.query.file);
    res.redirect('/recordings');
});

router.get('/download', function (req, res) {
    var file = req.query.file;
    switch (true) {
    case (file.indexOf('flac') >= 0):
        res.setHeader('Content-Type', 'audio/flac');
        break;
    case (file.indexOf('wav') >= 0):
        res.setHeader('Content-Type', 'audio/wav');
        break;
    case (file.indexOf('mp3') >= 0):
        res.setHeader('Content-Type', 'audio/mp3');
        break;
    }
    /*if (file.indexOf('flac') >= 0) {
        console.log('FLAC file');
    }*/
    console.log(res.getHeaders());
    //res.setHeader('Content-Type', 'audio/flac');
    res.download(req.query.file);
});

module.exports = router;
