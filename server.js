var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var settings = require('./routes/settings');
var recordings = require('./routes/recordings');
//var usbDetect = require('usb-detection');

var app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
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


app.use('/', index);
app.use('/settings', settings);
app.use('/recordings', recordings);


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

let dec2hex = (num) => {
    return parseInt(num, 10).toString(16);    
};

// Detect add/insert
/*usbDetect.on('add', function (device) {
    console.log('add', device);
    console.log(device.vendorId);
    console.log(dec2hex(device.vendorId));
    console.log(device.productId);
    console.log(dec2hex(device.productId));    
});*/
//usbDetect.on('add:vid', function(device) { console.log('add', device); });
//usbDetect.on('add:vid:pid', function(device) { console.log('add', device); });

// Detect remove
//usbDetect.on('remove', function (device) { console.log('remove', device); });
//usbDetect.on('remove:vid', function(device) { console.log('remove', device); });
//usbDetect.on('remove:vid:pid', function(device) { console.log('remove', device); });

// Detect add or remove (change)
//usbDetect.on('change', function (device) { console.log('change', device); });
//usbDetect.on('change:vid', function(device) { console.log('change', device); });
//usbDetect.on('change:vid:pid', function(device) { console.log('change', device); });

// Get a list of USB devices on your system, optionally filtered by `vid` or `pid`
//usbDetect.find(function (err, devices) { console.log('find', devices, err); });
//usbDetect.find(vid, function(err, devices) { console.log('find', devices, err); });
//usbDetect.find(vid, pid, function(err, devices) { console.log('find', devices, err); });