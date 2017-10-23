

let isPlaying = false;
let setPlaying = (playing) => {
    if (!playing) {
        $('#play-pause').find('span').removeClass('glyphicon-stop').addClass('glyphicon-play');
    } else {
        $('#play-pause').find('span').removeClass('glyphicon-play').addClass('glyphicon-stop');
    }
    isPlaying = playing;
};

document.addEventListener('DOMContentLoaded', function () {

    initListeners(); // add listers

});




let initListeners = (function () {

    var hostname = $('#hostname').text();
    console.log(hostname);

    var doPost = ( function(action) {
        $.ajax({
            type: 'POST',
            url: 'http://'+hostname+':3000/audio/'+action
        });
    });

    $('#play-pause').click(function () {
        if (!isPlaying) {
            doPost('play');
            setPlaying(true);

        } else {
            doPost('stop');
            setPlaying(false);
        }
    });

    $('#record').click(function () {
        var btn = $(this);
        if (!btn.hasClass('text-success')) {
            doPost('startRecord');
            
            btn.addClass('text-success');
        } else {
            doPost('stopRecord');
            
            btn.removeClass('text-success');
        }
    });
});

