const express = require('express');
const router = express.Router();
const settingsController = require('../src/settingsController.js')();

router.get('/', function (req, res) {
    res.render('settings', {'settings': settingsController.getAll()});
});

router.post('/', function (req) {

    if (req.body.command == 'set') {

        settingsController.set('bitDepth', req.body.bitDepth);
        settingsController.set('sampleRate', req.body.sampleRate);
        settingsController.set('compressionLevel', req.body.compressionLevel);
        settingsController.set('mp3Rate', req.body.mp3Rate);
        settingsController.set('captureDevice', req.body.captureDevice);
        settingsController.set('playbackDevice', req.body.playbackDevice);
        settingsController.set('highResFormat', req.body.highResFormat);
        settingsController.set('native24Bit', req.body.native24Bit);
        settingsController.save();
    } else {
        //res.send(settingsController.getAll());
    }
});

module.exports = router;
