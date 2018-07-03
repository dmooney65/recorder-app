
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


    var meter = null;
    var canvasContext = null;
    var WIDTH = 300;
    var HEIGHT = 50;
    this.rafID;

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

    

    /*window.setInterval(function () {
        doPost('getStatus');
    }, 2000);*/

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
    //exampleSocket.onopen(console.log('open'));
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
    /*let setupAudioContext = () => {
        // Create a new <audio> tag.
        canvasContext = document.getElementById('meter').getContext('2d');
        context = new (window.AudioContext || window.webkitAudioContext)();
        var source = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();
        meter = createAudioMeter(context, 0.98, 0.05, 500);
        source.connect(meter);
        drawLoop();

        // Connect the audio graph.
        source.connect(analyser);
        analyser.connect(context.destination);
    };*/

    let drawLoop = () => {
        // clear the background
        canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

        // check if we're currently clipping
        if (meter.checkClipping())
            canvasContext.fillStyle = 'red';
        else
            canvasContext.fillStyle = 'green';

        // draw a bar based on the current volume
        canvasContext.fillRect(0, 0, meter.volume * WIDTH * 1.4, HEIGHT);

        // set up the next visual callback
        this.rafID = window.requestAnimationFrame(drawLoop);
    };


    doPost('getStatus');

});



