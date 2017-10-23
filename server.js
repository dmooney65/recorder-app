var path = require('path'),
    express = require('express');


var app = express();
//app.set('view engine', 'html');
//Serving the files on the dist folder
app.use(express.static(path.join(__dirname, 'src')));
app.use('/bootstrap', express.static(path.join(__dirname, '/bootstrap')));
app.use('/css', express.static(path.join(__dirname, '/stylesheets')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));

var player = require('./src/audioController.js')();

var controls = function (req, res) {
    // ... perform some operations
    console.log(req.params);
    var func = req.params['function'];
    if (func == 'play') {
        console.log('playing');
        player.play();
    }
    if (func == 'stop') {
        console.log('stopping');
        player.stop();
    }
    if (func == 'startRecord') {
        console.log('starting Recording');
        player.startRecord();
    }
    if (func == 'stopRecord') {
        console.log('stopping Recording');
        player.stopRecord();
    }
    res.send('success');
    //next(); // Call next() so Express will call the next middleware function in the chain.
};


app.post('/audio/:function', controls);


//Send index.html when the user access the web
app.get('/', function (req, res) {
    res.sendFile('index.html');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

app.listen(3000);