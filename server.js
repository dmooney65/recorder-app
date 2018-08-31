const path = require('path');
const compression = require('compression');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const settingsRoute = require('./routes/settingsRouter');
const recordingsRoute = require('./routes/recordingsRouter');
const app = express();
const wssServer = require('./wssServer.js');

const { spawn, fork } = require('child_process');
global.audioWorker = fork(__dirname + '/src/audioWorker.js', []);
const settingsController = require('./src/settingsController');
settingsController.get().then((settings) => {
    global.audioWorker.send({ command: 'settings', arg: settings });
    if (settings.buttonControl) {
        if (settings.audioCard == 'generic' || settings.audioCard == 'audioinjector') {
            var reqStr = `./controlScripts/${settings.audioCard}/ButtonLedWorker.js`;
            let buttonLedWorker = require(reqStr);
            global.audioWorker.on('message', (msg) => {
                if (msg.hasOwnProperty('clipping')) {
                    buttonLedWorker.blinkLed(250);
                }
            });
        }
    }
}).catch(() => {
    settingsController.createDefault();
});

const index = require('./routes/indexRouter');
const mediaPath = require('./src/usbController');
global.audioWorker.send({ command: 'setRecordingsPath', arg: mediaPath.getRecordingPath() });


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
app.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404: File Not Found' });
});

// Handle 500
app.use((error, req, res) => {
    res.status(500);
    res.render('500', { title: '500: Internal Server Error', error: error });
});

const server = require('http').createServer(app);
server.listen(3000, listening = () => {
    console.log('Listening on %d', server.address().port, ' host', server.address().address);
});

server.on('error', () => {
    mediaPath.stopMonitoring();
    console.log('server errored');
});
var wss = wssServer.WebsocketServer();
wss.createServer(server);

process.on('SIGINT', () => {
    console.log('\nShutting down from SIGINT (Ctrl-C)');
    mediaPath.stopMonitoring();
    //Take care of exit weirdness on Pi
    if (process.arch == 'arm') {
        spawn('killall', ['node']);
    }
    process.exit();
});

process.on('unhandledRejection', (err) => {
    console.error(err);
});

