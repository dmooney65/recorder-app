var express = require('express');
var router = express.Router();
var files = require('../src/recordingsController');
var os = require('os');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('recordings', {});
});

router.post('/', function (req, res) {
    if (req.body.command == 'set') {
        //settings.set('bitDepth', req.body.bitDepth);
        //settings.set('sampleRate', req.body.sampleRate);
        //settings.set('compressionLevel', req.body.compressionLevel);
        //res.send(settings.save());
    } else {
        var resp = files.readFiles(os.homedir() + '/Music/');
        if (req.body.path == 'usb') {
            resp = files.readFiles('/media/');
        }
        resp.then(function (result) {
            res.send(result);
        });
        resp.catch(function () {
            console.log('Promise Rejected');
        });
    }

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
    res.download(req.query.file);
});

module.exports = router;
