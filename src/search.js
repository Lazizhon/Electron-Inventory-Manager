let searchBar = document.getElementById("search-bar");
var targRow;
var trPrevClass;
var searchVal;

(function() {
    document.getElementById("close-search-btn").addEventListener("click", function(e) {
        searchBar.value = null;
        removeHighlight();
    });

    document.getElementById("search-btn").addEventListener("click", function(e) {
        if (search() === false) {
            searchBar.className = "search-bar-err";
            searchBar.className = "search-bar-primary";
        }
    });
}());

searchBar.addEventListener("focus", function() {
    if (searchBar.value)
        this.setAttribute("data-initial-text", this.value);
});
searchBar.addEventListener("blur", removeHighlight);

searchBar.addEventListener("keypress", function(e) {
    if (e.keyCode === 13) {
        if (targRow)
            targRow.className = trPrevClass;
        searchVal = searchBar.value;
        if (search() === false) {
            searchBar.className = "search-bar-err";
            setTimeout(function() {
                clearWarn();
            }, 2000);
        }
    }
})

function clearWarn(elem) {
    searchBar.className = "search-bar-primary";
}

function removeHighlight() {
    if (this.value !== searchVal) {
        targRow.className = trPrevClass;
        var targChildren = targRow.childNodes;
        for (var i = 4; i < targChildren.length; i++) {
            targChildren[i].removeAttribute("style");
        }
    }
}

function search() {
    if (searchBar.value) {
        let found = false;
        targRow = document.getElementById((searchBar.value + "R").toUpperCase());
        if (targRow !== null) {
            window.location.hash = targRow.id;
            successAlert(searchBar.value + " found!");
            trPrevClass = targRow.className;
            targRow.className = "highlight-row";
            for (var i = 4; i < targRow.childNodes.length; i++) {
                targRow.childNodes[i].style.color = "white";
            }
            found = true;
        } else {
            warnAlert(searchBar.value + " not found...");
        }
        return found;
    }
};