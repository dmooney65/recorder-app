var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var audio = require('./src/audioController.js');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const os = require('os');
app.locals.hostname = os.hostname();
//Serving the files on the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, '/bootstrap')));
app.use('/css', express.static(path.join(__dirname, '/stylesheets')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));

var player = audio.Player({bitDepth: 24, sampleRate: 48000});

var controls = function (req, res) {
    //console.log(req.params);
    //Execute player function based on param
    var response = player[req.params['function']]();
    res.send(response);
    //next(); // Call next() so Express will call the next middleware function in the chain.
};


app.post('/audio/:function', controls);

app.use('/', index);

/*app.get('/', (req, res) => {
    res.render('index', {
        user: req.user
    });
});*/
//Send index.html when the user access the web
//app.get('/', function (req, res) {
//    res.sendFile('index.html');
//});

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
    res.render('error');
});

var listener = app.listen(3000);

//module.exports = listener;

//var listener = require('./../server.js');
var address = listener.address();
var host = address.address;
var port = address.port;
console.log('Listening on ' + host + ':' + port);