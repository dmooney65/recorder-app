let sampleRate;
let mp3Rate;

document.addEventListener('DOMContentLoaded', function () {

    sampleRate = $('#sampleRate');
    mp3Rate = $('#mp3Rate');
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
            'compressionLevel': 5, 'mp3Rate': mp3Rate.val()
        };
        doPost(action);
        createMessage('Settings Saved');
    });

});