// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const remote = require('electron').remote;
const jobj   = require('./inventory.json'); //(with path)

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

var currCat;
var times = 0;

populateSide();

function populateSide() {
  var list = jobj.Guide;
  var cat  = document.getElementById('cat');
  for (var i = 0; i < list.length; i++) {
    var listGuide = list[i];
    var listCat = listGuide.category;
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(listGuide.title));
    var ul = document.createElement('ul');
    ul.className = "prod";
    for (var k = 0; k < listCat.length; k++) {
      var a = document.createElement('a');
      a.id = listCat[k].name;
      a.onclick = function () {
        setElem(this);
      };
      var liIn = document.createElement('li');
      liIn.appendChild(document.createTextNode(listCat[k].name));
      a.appendChild(liIn);
      ul.appendChild(a);
    }
    li.appendChild(ul);
    cat.appendChild(li);
  }
};

function fillProduct(eID) {
    const MAXLINES = 50;
    var   numLines = 0;
    var list = jobj.Guide;
    var mainW = document.getElementById('mainWin');
    for (var i = 0; i < list.length; i++) {
        var listCat = list[i].category;
        for (var k = 0; k < listCat.length; k++) {
            if (listCat[k].name === eID && listCat[k].name !== currCat) {
              var listProd = listCat[k].products;
              removeElems("invBlockdr");
              removeElems("invBlocklt");
              for (var j = 0; j < listProd.length; j++) {
                var prodRow = document.createElement('div');
                var stock   = document.createElement('div');
                var desc    = document.createElement('div');
                var price   = document.createElement('div');
                var edit    = document.createElement('button');
                var del     = document.createElement('button');
                edit.className = "editBtn";
                del.className  = "delBtn";
                stock.contentEditable = true;
                desc.contentEditable  = true;
                price.contentEditable = true;
                if (j % 2 == 0) {
                  prodRow.className = "invBlocklt";
                }
                else {
                  prodRow.className = "invBlockdr"
                }
                stock.className   = "stckBlck";
                desc.className    = "descBlck";
                price.className   = "price";
                stock.innerHTML = listProd[j].stockID;
                desc.innerHTML  = listProd[j].title;
                price.innerHTML = listProd[j].price;
                prodRow.appendChild(stock);
                prodRow.appendChild(desc);
                prodRow.appendChild(price);
                prodRow.appendChild(del);
                prodRow.appendChild(edit);
                mainW.appendChild(prodRow);
                ++numLines;
              }
              break;
           }
        }
    }
    currCat = eID;
    if (numLines < MAXLINES) {
      for (var i = numLines; i < MAXLINES; i++) {
        var prodRow = document.createElement('div');
        if (i % 2 == 0) {
          prodRow.className = "invBlocklt";
        }
        else {
          prodRow.className = "invBlockdr";
        }
        mainW.appendChild(prodRow);
      }
    }
};

function setElem (elem) {
  fillProduct(elem.id);
}

function removeElems (cName) {
  elems = document.getElementsByClassName(cName);
  while (elems.length > 0) {
    elems[0].parentNode.removeChild(elems[0]);
  }
}
