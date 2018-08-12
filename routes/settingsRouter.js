const express = require('express');
const router = express.Router();
const settingsController = require('../src/settingsController.js');

router.get('/', function (req, res) {
    
    settingsController.get().then(function(data){
        res.render('settings', {'settings': data});
    });
});

router.post('/', function (req) {

    if (req.body.command == 'set') {

        var newSettings = {
            'bitDepth': req.body.bitDepth, 'sampleRate': req.body.sampleRate, 'compressionLevel': req.body.compressionLevel,
            'mp3Rate': req.body.mp3Rate, 'captureDevice': req.body.captureDevice, 'highResFormat': req.body.highResFormat,
            'native24Bit': req.body.native24Bit,'playbackDevice': req.body.playbackDevice
        };
        settingsController.save(newSettings);
    } else {
        //res.send(settingsController.getAll());
    }
});

module.exports = router;
