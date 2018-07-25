const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const settingsRoute = require('./routes/settings');
const recordingsRoute = require('./routes/recordings');
//const settingsController = require('./src/settingsController.js')();
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
app.use('/settings', settingsRoute);
app.use('/recordings', recordingsRoute);


app.use(function (req, res, next) {
    console.log('404 generated for request',req);
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

//Most wss functions are in audioController.js 
global.wss = new WebSocket.Server({ server });


global.wss.broadcast = function broadcast(data) {
    global.wss.clients.forEach(function each(client) {
        //console.log('broadcasting' + data);
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

//Uncomment these lines if using a pi with the button overlay functionality
//const { fork } = require('child_process');
//global.buttonLedWorker = fork(__dirname + '/controlScripts/audioinjector/ButtonLedWorker.js', []);
