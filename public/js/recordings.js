
document.addEventListener('DOMContentLoaded', function () {

    initRecordings();

});

var doPost = (function (action) {
    $.ajax({
        type: 'POST',
        data: action,
        url: '/recordings',
        success: function (data) {
            if (action.path == 'internal') {
                drawIntList(data);
            } else {
                drawUsbList(data);
            }

        },
        error: function (err) {
            throw err;
        }
    });
});

let drawIntList = (data) => {
    var list = $('#intlist > tbody');
    renderList(list, data);
};

let drawUsbList = (data) => {
    var list = $('#usblist > tbody');
    renderList(list, data);
};

let renderList = (list, data) => {
    if (data.length > 0) {
        data.forEach(function (element) {
            var encodedPath = encodeURIComponent(element.path + element.file);
            list.append('<tr><td><a href=/recordings/download?file='
                + encodedPath
                + '>  <span class="glyphicon glyphicon-download-alt" ></span></a>'
                + '<a href=/recordings/delete?file='
                + encodedPath
                + ' onclick="return confirm(\'Are you sure you want to delete this item?\');">  <span class="glyphicon glyphicon-remove"></span></a>'
                + '<a href=/recordings/encode?file='
                + encodedPath
                + '>  <span class="glyphicon glyphicon-export"></span></a>'
                + '<td>'
                + element.file + '</td>' 
                
                + '<td>' + element.duration + '</td>'
                + '<td>' + element.fileSize + '</td>'
                + '<td>' + element.bitRate + '</td>'
                +'</tr>');
        });
    } else {
        list.append('<tr><td>No recordings found</td></tr>');
    }
};

let initRecordings = (function () {

    setupNav(2);

    doPost({ 'command': 'get', 'path': 'internal' });
    doPost({ 'command': 'get', 'path': 'usb' });
});


