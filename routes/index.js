var express = require('express');
var router = express.Router();
//var os = require('os');
var ip = require('ip');
var audio = require('../src/audioController.js');

var ipaddress = ip.address();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { hostname: ipaddress });
});

var player;

var controls = function (req, res) {

    if (!player) {
        player = audio.Player();
    }
    //Execute player function based on param
    var response = player[req.body.command]();
    res.send(response);
};


router.post('/audio', controls);


module.exports = router;
