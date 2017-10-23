
const execStream = require('exec-stream');

var arecord = execStream('arecord', ['-f', 'dat']);
var aplay = execStream('aplay', []);
arecord.pipe(aplay);
