let sampleRate;

document.addEventListener('DOMContentLoaded', function () {

    sampleRate = $('#sampleRate');
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
                //console.log(data);
                sampleRate.val(data.bitDepth+'/'+data.sampleRate);
                //return data;
            },
            error: function (err) {
                throw err;
            }
        });
    });

    doPost({ 'command': 'get' });
    //

    $('#save').click(function (e) {
        e.preventDefault();
        var sampling = sampleRate.val().split('/');
        var action = { 'command': 'set', 'bitDepth': sampling[0], 'sampleRate': sampling[1], 'compressionLevel': 5 };
        doPost(action);
        createMessage('Settings Saved');
    });
    //var settings = fs.createReadStream()

});