var Transform = require('stream').Transform;
var inherits = require('util').inherits;

module.exports = ClipDetect;

function ClipDetect(options) {
    if (!(this instanceof ClipDetect)) {
        return new ClipDetect(options);
    }
    options = options || {};
    this.inputChannels = options.inputChannels || 2;
    this.inputBitDepth = options.inputBitDepth || 16;
    this.outputBitDepth = options.outputBitDepth || this.inputBitDepth;
    if (!options) options = {};
    options.objectMode = true;
    Transform.call(this, options);
}

inherits(ClipDetect, Transform);

ClipDetect.prototype._transform = function _transform(chunk, encoding, callback) {
    var max = 0;// = -32767;
    var min = 0;// = 32767;
    var value;
    var MAX = Math.pow(2, this.inputBitDepth - 1) - 1;
    var MIN = -Math.pow(2, this.inputBitDepth - 1);
    //console.log(MAX);
    //console.log(buffer.readIntLE(0, this.inputBitDepth / 8));
    //try {

    let samples = Math.trunc(chunk.length / this.inputBitDepth);
    //console.log(chunk.length);
    for (var i = 0; i < samples; i++) {
        //console.log(i);        
        value = chunk.readIntLE(i, this.inputBitDepth / 8);
        if (value > max) {
            if ((value / MAX) > 0.98) {
                //console.log(value / MAX);
                max = value;
                break;
            }
        }
        if (value < min) {
            if ((value / MIN) > 0.98) {
                //console.log(value / MIN);
                min = value;
                break;
            }
        }
        i += (this.inputBitDepth / 8) - 1;
    }

    if (min != 0 || max != 0) {
        this.push('true');
    } else {
        //console.log('empty');
        this.push('false');
    }
    callback();
};
