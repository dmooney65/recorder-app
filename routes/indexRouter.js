var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index');
});

var status;

global.audioWorker.on('message', (msg) => {
    //Exclude clipping messages
    if (!msg.hasOwnProperty('clipping')) {
        status = msg;
    }
});

router.post('/audio', (req, res) => {

    //Execute player function based on param
    if (global.audioWorker.send({ command: req.body.command })) {
        switch (req.body.command) {
            case 'getStatus':
                res.send(status);
                break;
            default:
                //Hack to make sure up to date status is returned
                setTimeout(() => {
                    res.send(status);
                }, 500);
        }
    }
});


module.exports = router;
