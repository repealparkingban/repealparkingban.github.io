$(window).on('load', function () {
    var nav = $("#navigation"),
        navLockClass = "navigation-locked",
        pos = nav.offset().top,
        navHeight;

    nav.after('<div class="nav-placeholder"></div>');
    function setMarginPad() {
        navHeight = nav.innerHeight();
        nav.css({ "margin-bottom": "-" + navHeight + "px" });
        nav.next().css({ "padding-top": + (navHeight) + "px" });
    };
    setMarginPad();

    $(window).resize(function () {
        setMarginPad();
    });

    function lockNav() {
        var top = $(this).scrollTop();
        top >= pos ?
            nav.addClass(navLockClass) :
            nav.removeClass(navLockClass);
    };
    lockNav();

    $(window).scroll(function () {
        lockNav();
    });
});