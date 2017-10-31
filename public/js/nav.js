var navs;

document.addEventListener('DOMContentLoaded', function () {
    navs = $('ul.nav').find('li');
    initNav();

});

let initNav = () => {

    $(navs[0]).click(function () {
        if (window.location.pathname != '/') {
            window.location.href = '/';
        }
    });

    $(navs[1]).click(function () {
        if (!$(this).hasClass('disabled')) {
            window.location.href = '/settings';
        };
    });

    $(navs[2]).click(function () {
        if (!$(this).hasClass('disabled')) {
            window.location.href = '/recordings';
        };
    });


};

let setupNav = (index) => {
    $(navs).removeClass('active');
    var nav = $($(navs)[index]);
    nav.addClass('active');
    nav.click(function (e) {
        e.preventDefault();
    });

};

let disableSecondary = (trueFalse) => {
    for (var i = 1, len = navs.length; i < len; i++) {
        if (trueFalse) {
            $(navs[i]).addClass('disabled');
        } else {
            $(navs[i]).removeClass('disabled');
        }
    }
};