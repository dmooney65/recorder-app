const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { fork } = require('child_process');
const index = require('./routes/index');
const settings = require('./routes/settings');
const recordings = require('./routes/recordings');
const url = require('url');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//const os = require('os');
//app.locals.hostname = os.hostname();
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
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const server = http.createServer(app);
server.listen(3000, function listening() {
    console.log('Listening on %d', server.address().port, ' host', server.address().address);
});
const wss = new WebSocket.Server({ server });

//var listener = app.listen(3000);

//module.exports = listener;

//var address = listener.address();
//var host = address.address;
//var port = address.port;
//console.log('Listening on ' + host + ':' + port);



/*wss.on('connection', (socket) => {
    socket.emit('hello', {
        greeting: 'Hello Paul'
    });
});*/



//server.on('upgrade', wss.handleUpgrade);
wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    console.log(location);
    
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send('something');
    });

    //ws.send('something');
    
});

if (process.env.AUDIO_CARD == 'audioinjector') {
    global.buttonLedWorker = fork(__dirname + '/controlScripts/audioinjector/ButtonLedWorker.js', []);
}   
