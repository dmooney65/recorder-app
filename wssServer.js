const WebSocket = require('ws');
var wss;
module.exports.WebsocketServer = () => {

    global.audioWorker.on('message', (msg) => {
        wss.broadcast(msg);
    });
    global.audioWorker.send({ command: 'getStatus' });

    let createServer = (server) => {

        wss = new WebSocket.Server({ server });
        wss.on('error', () => console.log('wss errored'));
        wss.broadcast = broadcast = (data) => {
            wss.clients.forEach(each = (client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        };
        wss.on('connection', connection = (client) => {
            client.on('message', incoming = (msg) => {
                if (msg == 'play') {
                    global.audioWorker.send({ command: 'play' });
                } else if (msg == 'stop') {
                    global.audioWorker.send({ command: 'stop' });
                } else if (msg == 'startRecord') {
                    global.audioWorker.send({ command: 'startRecord' });
                } else if (msg == 'stopRecord') {
                    global.audioWorker.send({ command: 'stopRecord' });
                } else if (msg == 'getStatus') {
                    global.audioWorker.send({ command: 'getStatus' });
                }
            });
            client.on('error', () => {
                console.log('client error');
            });
        });

    };

    let get = () => {
        return wss;
    };

    return {
        createServer: createServer,
        get: get
    };

};