var express = require('express');
var router = express.Router();
var os = require('os');

var host = os.hostname();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { hostname: host });
});

module.exports = router;
