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
    //this.outputBitDepth = options.outputBitDepth || this.inputBitDepth;
    //if (!options) options = {};
    this.offset = 0;
    this.byteLen = 2;
    this.readLen = 2;
    this.MAX = 32767;
    //this.MAX = 65534
    this.MIN = -32768;
    if (this.inputBitDepth == 32) {
        this.offset = 1;
    }
    if (this.inputBitDepth != 16) {
        this.MAX = 8388607;
        //this.MAX = 16777214
        this.MIN = -8388608;
        this.byteLen = 4;
        this.readLen = 3;
    }
    options.objectMode = true;
    Transform.call(this, options);
}

inherits(ClipDetect, Transform);

ClipDetect.prototype._transform = function _transform(chunk, encoding, callback) {
    var max = 0;// 
    var min = 0;// 
    var value;


    let samples = Math.trunc(chunk.length / this.byteLen);
    for (var i = 0; i < samples;) {
        value = chunk.readIntLE(i + this.offset, this.readLen);
        if (value > max) {
            //value /= this.MAX;
            if ((value / this.MAX) > 0.98) {
                console.log(value);
                max = value;
                break;
            }
        }
        if (value < min) {
            if ((value / this.MIN) > 0.98) {
                //console.log(value);
                min = value;
                break;
            }
        }
        i += this.byteLen;
    }

    if (min != 0 || max != 0) {
        this.push('true');
    } else {
        //console.log('empty');
        this.push('false');
    }
    callback();
};
