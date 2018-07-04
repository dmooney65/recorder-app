
let playPauseBtn;
let recordingBtn;
let clipDetect;


document.addEventListener('DOMContentLoaded', function () {

    playPauseBtn = $('#play-pause');
    recordingBtn = $('#record');
    clipDetect = $('#clipDetect').find('span');
    
    initControls();

});

let setPlaying = (playing) => {
    if (!playing) {
        playPauseBtn.find('span').removeClass('glyphicon-stop').addClass('glyphicon-play');
        clipDetect.removeClass('text-success');
    } else {
        playPauseBtn.find('span').removeClass('glyphicon-play').addClass('glyphicon-stop');
        clipDetect.addClass('text-success');
    }
};

let setRecording = (recording) => {
    if (!recording) {
        recordingBtn.find('span').removeClass('text-success');
    } else {
        recordingBtn.find('span').addClass('text-success');
    }
};


let setPath = (recordingsPath) => {
    $('#path').text(recordingsPath);
};

let initControls = (function () {

    setupNav(0);

    var doPost = (function (action) {
        $.ajax({
            type: 'POST',
            data: { 'command': action },
            url: '/audio',
            /*success: function (data) {
                setStatus(data);
            },*/
            error: function (err) {
                throw err;
            }
        });
    });
    
    let setStatus = (data) => {
        setPlaying(data.playing);
        setRecording(data.recording);
        setPath(data.recordingsPath);
    };

    

    playPauseBtn.click(function () {
        if (!$(this).find('span').hasClass('glyphicon-stop')) {
            doPost('play');
            setPlaying(true);
            //disableSecondary(true);
        } else {
            doPost('stop');
            setPlaying(false);
            //disableSecondary(false);
        }
    });

    recordingBtn.click(function () {
        var span = $(this).find('span');
        if (!span.hasClass('text-success')) {
            doPost('startRecord');
            setRecording(true);
        } else {
            doPost('stopRecord');
            setRecording(false);
        }
    });

    var controlSocket = new WebSocket(window.location.href.replace('http','ws'));

    controlSocket.onopen = function (event) {
        controlSocket.send('getStatus', event);
    };

    var redTime = animate();

    controlSocket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        //console.log(data.toString());
        if(data.hasOwnProperty('clipping')){
            clipDetect.addClass('text-danger');
            clearInterval(redTime);
            redTime = animate();
        } else if(data.hasOwnProperty('playing')){
            setStatus(data);
        }
    };

    function animate() {
        return setInterval(function() {
            clipDetect.removeClass('text-danger');
        }, 500);
    }

    doPost('getStatus');

});



