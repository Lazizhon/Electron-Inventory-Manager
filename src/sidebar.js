var sidebar = document.getElementById('sidebar');

(function() {
    document.getElementById('side-trigger').onmouseover = function() {
        if (sidebar.className == "sidebar-closed") {
            sidebar.className = "sidebar-open";
        }
    };

    sidebar.onmouseleave = function() {
        if (sidebar.className == "sidebar-open") {
            sidebar.className = "sidebar-closed";
        }
    };
})();

function removeActive() {
    let active = document.getElementsByClassName('active-prod');
    for (let i = 0; i < active.length; i++) {
        active[i].className = "normal";
    }
    let activeCat = document.getElementsByClassName('active-prodCat');
    if (activeCat[0]) activeCat[0].className = "";
}

function setActive(elem) {
    var div = elem.parentNode.parentNode.childNodes[0];
    div.className = "active-prodCat";
    elem.childNodes[0].className = "active-prod";
}