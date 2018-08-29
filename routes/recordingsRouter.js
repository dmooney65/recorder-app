var express = require('express');
var router = express.Router();
var files = require('../src/recordingsController');
var os = require('os');
//var spawn = require('child_process').spawnSync;
var usb = require('../src/usbController');


router.get('/', (req, res) => {
    var localResp = files.readFiles(os.homedir() + '/Music/');

    localResp.then( (localResults) => {

        var usbPath = (usb.getRecordingPath())
        if (usbPath.indexOf('media') > 0) {
            usbResp = files.readFiles(usbPath);
            
            usbResp.then( (usbResults) => {
                res.render('recordings', { 'localResults': localResults, 'usbResults': usbResults });
            });
            usbResp.catch( ()  => {
                console.log('Promise Rejected');
            });
        } else {
            res.render('recordings', { 'localResults': localResults, 'usbResults': [] });
        }
    });

    localResp.catch( () => {
        console.log('Promise Rejected');
    });
});

router.get('/encode', (req, res) => {
    files.encodeFile(req.query.file);
    res.redirect('/recordings');
});

router.get('/delete', (req, res) => {
    files.deleteFile(req.query.file);
    res.redirect('/recordings');
});

router.get('/download', (req, res) => {
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
    
    console.log(res.getHeaders());
    res.download(req.query.file);
});

module.exports = router;
