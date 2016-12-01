// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

var jobj = require('./inventory.json'); //(with path)

populateSide();

function populateSide() {
    var cat = document.getElementById('cat');

    var list = jobj.Guide;
    for (var i = 0; i < list.length; i++) {    
        var listGuide = list[i];
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(listGuide.title));
        cat.appendChild(li);
        for (var j = 0; j < listGuide.length; j++) {    

            console.log(listGuide.category[0].name);
        }
    }
}