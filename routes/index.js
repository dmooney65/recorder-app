var express = require('express');
var router = express.Router();
var os = require('os');
var audio = require('../src/audioController.js');
var settings = require('../src/settingsController.js')();

var host = os.hostname();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { hostname: host });
});

var player;// = audio.Player({bitDepth: 24, sampleRate: 48000});

var controls = function (req, res) {

    if(!player){
        player = audio.Player({bitDepth: settings.get('bitDepth'), sampleRate:settings.get('sampleRate')});
    }
    //Execute player function based on param
    var response = player[req.body.command]();
    res.send(response);
};


router.post('/audio', controls);


module.exports = router;
