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
        res.send(settings.save());
    } else {
        res.send(settings.getAll());
    }

});

module.exports = router;
