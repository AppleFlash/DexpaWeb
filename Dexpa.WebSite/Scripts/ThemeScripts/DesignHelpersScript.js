$(".containerWithoutPageHeader").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() -33);
$(".containerWithPageHeader").height($(window).height() - $('.headerbar').height()-1);
$(".tableContainerPaginator").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() - $('.bottomPaginator').height() - 69);
$(".containerForTableOnMainPage").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() - $('.map-wrapper').height() - 33);

window.onresize = function () {
    $(".containerWithoutPageHeader").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() - 33);
    $(".containerWithPageHeader").height($(window).height() - $('.headerbar').height()-1);
    $(".tableContainerPaginator").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() - $('.bottomPaginator').height() - 69);
    $(".containerForTableOnMainPage").height($(window).height() - $('.pageheader').height() - $('.headerbar').height() - $('.map-wrapper').height() - 33);
}