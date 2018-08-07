var express = require('express');
var router = express.Router();
//var os = require('os');
var audio = require('../src/audioController.js');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
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
