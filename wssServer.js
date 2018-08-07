const WebSocket = require('ws');
var wss;

module.exports.WebsocketServer = () => {
    //Most wss functions are in audioController.js
    let createServer = (server) => {
        wss = new WebSocket.Server({ server });
        wss.on('error', () => console.log('wss errored'));
        wss.broadcast = function broadcast(data) {
            wss.clients.forEach(function each(client) {
                //console.log('broadcasting' + data);
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        };
    };

    //let broadcast = (data) => {
        
    //};

    let get = () => {
        return wss;
    };


    return {
        createServer: createServer,
        get: get
    };

};