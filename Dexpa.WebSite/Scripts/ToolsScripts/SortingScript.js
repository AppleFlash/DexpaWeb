var Collection;
var OrderBy;

function sortingInitialisation(collection, orderBy) {
    Collection = collection;
    OrderBy = orderBy;
}

var Increase = true;
var PredicateHistory;

function sortBy(predicate) {
    var reverse = false;
    var icon;
    if (PredicateHistory != null) {
        $("span#" + PredicateHistory.replace('.', '')).removeAttr('class');
    }
    if (PredicateHistory != predicate) {
        Increase = true;
    }
    PredicateHistory = predicate;
    if (Increase) {
        Increase = false;
        icon = "up";
    } else {
        reverse = true;
        Increase = true;
        icon = "down";
    }
    $("span#" + predicate.replace('.', '')).attr("class", "fa fa-caret-" + icon);
    //var orderBy = $filter('orderBy');
    return OrderBy(Collection, predicate, reverse);
};