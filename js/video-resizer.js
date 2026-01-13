(function ($) {
    function initVideoResizer() {
        var videos = $('iframe[src^="https://player.vimeo.com"], iframe[src^="http://www.youtube.com"], iframe[src^="https://www.youtube.com"], object, embed');
        var parentElement = $("#content");
        if ($("#homeContent").length) {
            parentElement = $("#homeContent");
        }
        videos.each(function () {
            var v = $(this);
            v
                .attr('data-aspectRatio', v.height() / v.width())
                .attr('data-oldWidth', v.attr('width'));
        });
        $(window).resize(function () {
            var newWidth = parentElement.width();
            videos.each(function () {
                var element = $(this),
                    oldWidth = element.attr('data-oldWidth');
                if (oldWidth > newWidth) {
                    element
                        .removeAttr('height')
                        .removeAttr('width')
                        .width(newWidth)
                        .height(newWidth * element.attr('data-aspectRatio'));
                }
            });
        }).resize();
    }

    // Run when document is ready
    $(document).ready(initVideoResizer);
})(jQuery);