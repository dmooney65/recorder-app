const express = require('express');
const router = express.Router();
var settings = require('../src/settingsController.js')();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('settings', {});
});

router.post('/', function (req, res) {

    if (req.body.command == 'set') {
        settings.set('bitDepth', req.body.bitDepth);
        settings.set('sampleRate', req.body.sampleRate);
        settings.set('compressionLevel', req.body.compressionLevel);
        settings.set('mp3Rate', req.body.mp3Rate);
        settings.set('defaultCard', req.body.defaultCard);
        settings.set('highResFormat', req.body.highResFormat);
        settings.set('native24Bit', req.body.native24Bit);
        res.send(settings.save());
    } else {
        res.send(settings.getAll());
    }

});

module.exports = router;
