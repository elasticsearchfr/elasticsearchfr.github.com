$(function() {
    if ($('#authors').length) {
        var hash = window.location.hash.substr(1);
        if (hash != '') {
            $('#authors div#' + hash + ' div').addClass('selected');
            $(window).scrollTop(0);
        }
    }
});
