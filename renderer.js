// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

var jobj = require('./inventory.json'); //(with path)

var cat  = document.getElementById('cat');
var ib   = document.getElementById('invBlock');
var main = document.getElementById('mainWin');
var list = jobj.Guide;

populateSide();

fillProduct();

function populateSide() {
  for (var i = 0; i < list.length; i++) {
    var listGuide = list[i];
    var listCat = listGuide.category;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(listGuide.title));
    var ul = document.createElement('ul');
    for (var k = 0; k < listCat.length; k++) {
      var liIn = document.createElement('li');
      liIn.appendChild(document.createTextNode(listCat[k].name));
      ul.appendChild(liIn);
    }
    li.appendChild(ul);
    cat.appendChild(li);
  }
}

function fillProduct() {
    for (var i = 0; i < list.length; i++) {
        var listCat = list[i].category;
        for (var k = 0; k < listCat.length; k++) {
            var listProd = listCat[k].products;
            for (var j = 0; j < listProd.length; j++) {
                
            }
        }
    }
}