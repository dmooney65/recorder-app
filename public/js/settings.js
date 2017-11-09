let sampleRate;
let mp3Rate;
let defaultCard;
let highResFormat;

document.addEventListener('DOMContentLoaded', function () {

    sampleRate = $('#sampleRate');
    mp3Rate = $('#mp3Rate');
    defaultCard = $('#defaultCard');
    highResFormat = $('#highResFormat');
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
                defaultCard.val(data.defaultCard);
                highResFormat.val(data.highResFormat);
            },
            error: function (err) {
                throw err;
            }
        });
    });

    doPost({ 'command': 'get' });

    $('#save').click(function (e) {
        e.preventDefault();
        var sampling = sampleRate.val().split('/');
        var action = {
            'command': 'set', 'bitDepth': sampling[0], 'sampleRate': sampling[1],
            'compressionLevel': 5, 'mp3Rate': mp3Rate.val(), 'defaultCard': defaultCard.val(),
            'highResFormat': highResFormat.val()
        };
        doPost(action);
        createMessage('Settings Saved');
    });

});