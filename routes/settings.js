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
        res.send(settings.save());
    } else {
        res.send(settings.getAll());
    }

    //res = settings.get();
});

module.exports = router;
