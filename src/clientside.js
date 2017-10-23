
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

let doPost = ( function(action) {
    $.ajax({
        type: 'POST',
        url: 'http://zen:3000/audio/'+action
    });
});


let initListeners = (function () {
    $('#play-pause').click(function () {
        if (!isPlaying) {
            doPost('play')
            setPlaying(true);

        } else {
            $.ajax({
                type: 'POST',
                url: 'http://zen:3000/audio/stop'
            });
            setPlaying(false);
        }
    });

    $('#record').click(function () {
        var btn = $(this);
        if (!btn.hasClass('text-success')) {
            $.ajax({
                type: 'POST',
                url: 'http://zen:3000/audio/startRecord'
            });
            btn.addClass('text-success');
        } else {
            $.ajax({
                type: 'POST',
                url: 'http://zen:3000/audio/stopRecord'
            });
            btn.removeClass('text-success');
        }
    });
});

