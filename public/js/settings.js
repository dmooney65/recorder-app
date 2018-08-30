let sampleRate;
let mp3Rate;
let captureDevice;
let playbackDevice;
let highResFormat;
let native24Bit;


document.addEventListener('DOMContentLoaded', function () {
    sampleRate = $('#sampleRate');
    mp3Rate = $('#mp3Rate');
    captureDevice = $('#captureDevice');
    playbackDevice = $('#playbackDevice');
    highResFormat = $('#highResFormat');
    native24Bit = $('#native24Bit');

    initSettings();
});

let initSettings = (function () {
    setupNav(1);

    var doPost = (function (action) {
        $.ajax({
            type: 'POST',
            data: action,
            url: '/settings',
            success: function (data) {
                sampleRate.val(data.bitDepth + '/' + data.sampleRate);
                mp3Rate.val(data.mp3Rate);
                captureDevice.val(data.captureDevice);
                playbackDevice.val(data.playbackDevice);
                highResFormat.val(data.highResFormat);
                native24Bit.prop('checked', data.native24Bit == 'true');
                if (data.audioCard == 'audioinjector') {
                    sampleRate.find('option')[4].hidden = true;
                }
            },
            error: function (err) {
                throw err;
            }
        });
    });

    $('#save').click(function () {
        //e.preventDefault();
        var sampling = sampleRate.children("option").filter(":selected").text().split('/');
        console.log(sampling);
        var action = {
            'command': 'set', 'bitDepth': sampling[0], 'sampleRate': sampling[1],
            'compressionLevel': 5, 'mp3Rate': mp3Rate.val(), 'captureDevice': captureDevice.val(),
            'playbackDevice': playbackDevice.val(), 'highResFormat': highResFormat.val(), 'native24Bit': native24Bit.prop('checked')
        };
        doPost(action);
    });

});