// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
const jobj   = require('./inventory.json'); //(with path)

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

populateSide();

fillProduct();

function populateSide() {
  var list = jobj.Guide;
  var cat  = document.getElementById('cat');
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
    var list = jobj.Guide;
    var ib   = document.getElementById('invBlock');
    var mainW = document.getElementById('mainWin');
    for (var i = 0; i < list.length; i++) {
        var listCat = list[i].category;
        for (var k = 0; k < listCat.length; k++) {
            var listProd = listCat[k].products;
            for (var j = 0; j < listProd.length; j++) {
                var prodRow = document.createElement('div');
                prodRow.id = "invBlock";
                prodRow.appendChild(document.createTextNode("HI"));
                mainW.appendChild(prodRow);
                console.log("HELLO");
            }
        }
    }
}