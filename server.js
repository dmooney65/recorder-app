const path = require('path');
const compression = require('compression');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const index = require('./routes/indexRouter');
const settingsRoute = require('./routes/settingsRouter');
const recordingsRoute = require('./routes/recordingsRouter');
const app = express();
const wssServer = require('./wssServer.js');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(compression());
app.use(favicon(path.join(__dirname, 'public', '/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, '/bootstrap')));
app.use('/css', express.static(path.join(__dirname, '/stylesheets')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist')));


app.use('/', index);
app.use('/settings', settingsRoute);
app.use('/recordings', recordingsRoute);

// Handle 404
app.use(function (req, res) {
    res.status(404);
    res.render('404', {title: '404: File Not Found'});
});

// Handle 500
app.use(function (error, req, res) {
    res.status(500);
    res.render('500.jade', {title:'500: Internal Server Error', error: error});
});

const server = require('http').createServer(app);
server.listen(3000, function listening() {
    console.log('Listening on %d', server.address().port, ' host', server.address().address);
});

server.on('error', () => console.log('server errored'));
var wss = wssServer.WebsocketServer();
wss.createServer(server);

process.on('SIGINT', function () {
    console.log('\nShutting down from SIGINT (Ctrl-C)');
    process.exit();
});

process.on('unhandledRejection', (err) => {
    console.error(err);
});

//Uncomment these lines if using a pi with the button overlay functionality
//const { fork } = require('child_process');
//global.buttonLedWorker = fork(__dirname + '/controlScripts/audioinjector/ButtonLedWorker.js', []);
