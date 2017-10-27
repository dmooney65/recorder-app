
let playPauseBtn;
let recordingBtn;
let localAudioBtn;

document.addEventListener('DOMContentLoaded', function () {

    playPauseBtn = $('#play-pause');
    recordingBtn = $('#record');
    localAudioBtn = $('#localaudio');
    initControls(); // add listers

});

let setPlaying = (playing) => {
    if (!playing) {
        playPauseBtn.find('span').removeClass('glyphicon-stop').addClass('glyphicon-play');
    } else {
        playPauseBtn.find('span').removeClass('glyphicon-play').addClass('glyphicon-stop');
    }
};

let setRecording = (recording) => {
    if (!recording) {
        recordingBtn.find('span').removeClass('text-success');
    } else {
        recordingBtn.find('span').addClass('text-success');
    }
};

let setServing = (serving) => {
    if (!serving) {
        localAudioBtn.find('span').removeClass('text-success');
    } else {
        localAudioBtn.find('span').addClass('text-success');
    }
};

let initControls = (function () {

    setupNav(0);


    var hostname = $('#hostname').text();
    var audio = document.getElementById('player');
    audio.crossOrigin = 'anonymous';
    var context;
    var meter = null;
    var canvasContext = null;
    var WIDTH=300;
    var HEIGHT=50;
    var rafID = null;

    var doPost = (function (action) {
        $.ajax({
            type: 'POST',
            data: { 'command': action },
            url: '/audio',
            success: function (data) {
                setStatus(data);
            },
            error: function (err) {
                throw err;
            }
        });
    });

    window.setInterval(function () {
        doPost('getStatus');
    }, 1000);


    let setStatus = (status) => {
        setPlaying(status['playing']);
        setRecording(status['recording']);
        setServing(status['serving']);
    };

    playPauseBtn.click(function () {
        if (!$(this).find('span').hasClass('glyphicon-stop')) {
            doPost('play');
            setPlaying(true);
            disableSecondary(true);                    
        } else {
            doPost('stop');
            setPlaying(false);
            disableSecondary(false);                    
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

    localAudioBtn.click(function () {
        var span = $(this).find('span');
        if (!span.hasClass('text-success')) {
            doPost('startServer');
            setServing(true);
            if (!context) {
                setupAudioContext();
            }
            audio.src = 'http://' + hostname + ':3080';
            audio.play();
        } else {
            doPost('stopServer');
            //audio.pause();
            setServing(false);
        }
    });

    function setupAudioContext() {
        // Create a new <audio> tag.
        canvasContext = document.getElementById('meter').getContext('2d');
        context = new (window.AudioContext || window.webkitAudioContext)();
        var source = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();
        meter = createAudioMeter(context,0.99,0.05,500);
        source.connect(meter);
        drawLoop();        
        
        //var filter = context.createBiquadFilter();
        //filter.type = 'highpass';
        //filter.frequency.value = 500;

        // Connect the audio graph.
        source.connect(analyser);
        analyser.connect(context.destination);
    }

    function drawLoop( time ) {
        // clear the background
        canvasContext.clearRect(0,0,WIDTH,HEIGHT);
    
        // check if we're currently clipping
        if (meter.checkClipping())
            canvasContext.fillStyle = 'red';
        else
            canvasContext.fillStyle = 'green';
    
        // draw a bar based on the current volume
        canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);
    
        // set up the next visual callback
        rafID = window.requestAnimationFrame( drawLoop );
    }

});



