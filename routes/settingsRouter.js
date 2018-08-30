const express = require('express');
const router = express.Router();
const cardInfo = require('node-alsa-cardinfo');
const settingsController = require('../src/settingsController.js');

router.get('/', (req, res) => {

    settingsController.get().then((data) => {
        var card = cardInfo.get(data.captureDevice, cardInfo.CAPTURE);
        if (card.error) {
            res.render('settingsError');
        } else {
            if (card.sampleFormats.includes('S24_LE')) {
                data.native24Bit = "true";
            } else {
                data.native24Bit = "false";
            }
            var encodeRates = [];
            if (card.sampleRates.includes(44100)) {
                encodeRates.push('16/44100');
            }
            if (card.sampleRates.includes(48000)) {
                encodeRates.push('16/48000');
                encodeRates.push('24/48000');
            }
            if (card.sampleRates.includes(88200)) {
                encodeRates.push('24/88200');
            }
            if (card.sampleRates.includes(96000)) {
                encodeRates.push('24/96000');
            }
            if (card.sampleRates.includes(192000)) {
                encodeRates.push('24/192000');
            }
            res.render('settings', { 'settings': data, 'encodeRates': encodeRates });
        }
    });
});

router.post('/', (req) => {

    if (req.body.command == 'set') {

        var newSettings = {
            'bitDepth': req.body.bitDepth, 'sampleRate': req.body.sampleRate, 'compressionLevel': req.body.compressionLevel,
            'mp3Rate': req.body.mp3Rate, 'captureDevice': req.body.captureDevice, 'highResFormat': req.body.highResFormat,
            'native24Bit': req.body.native24Bit, 'playbackDevice': req.body.playbackDevice
        };
        settingsController.save(newSettings);
    } else {
        //res.send(settingsController.getAll());
    }
});

module.exports = router;
