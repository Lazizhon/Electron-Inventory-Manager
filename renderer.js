// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const jsfp   = './inventory.json';
const remote = require('electron').remote;
const jobj   = require(jsfp); //(with path)
const fs     = require('fs');
var docChanged = false;
var eleChanged = false;

var currCat;
var times = 0;
var numLines;

var eId;

document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    if (docChanged || eleChanged) {
      if (confirm("Exit without saving?")) {
        window.close();
      }
    }
    else {
      window.close();
    }
});

document.getElementById("add-btn").addEventListener("click", function(e) {
    addProd();
});

document.getElementById("save-btn").addEventListener("click", function (e) {
  if (docChanged) {
  docChanged = false;
    this.className = "btn btn-primary";
    var jsav = JSON.stringify(jobj);
    fs.writeFile(jsfp, jsav, function (err) {
      if(err){
            alert("An error ocurred updating the file"+ err.message);
            console.log(err);
            return;
      }
                    
      alert("The file has been succesfully saved");
 });
}
})


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

function saveProd(id) {
  if (eleChanged) {
    eleChanged = false;
    var list = jobj.Guide;
    var ID = (id.id.slice(0, -2) + "R");
    var row = document.getElementById(ID);
    for (var i = 0; i < list.length; i++) {
      var listCat = list[i].category;
      for (var k = 0; k < listCat.length; k++) {
        var listProd = listCat[k].products;
        if (listCat[k].name === currCat) {
          for (var j = 0; j < listProd.length; j++) {
            var children = row.childNodes;
            if (row.id.slice(0, -1) === listProd[j].stockID) {
              listProd[j].stockID = children[0].innerHTML;
              listProd[j].title = children[1].innerHTML;
              listProd[j].price = children[2].innerHTML;
              id.id = (children[0].innerHTML + "SB");
              docChanged = true;
              document.getElementById("save-btn").className="btn btn-warning";
              id.className = "save-btn-primary";
            }
          }
        }
      }
    }
  }
}

function fillProduct(eID) {
    eId = eID;
    const MAXLINES = 50;
    numLines = 0;
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
                var save    = document.createElement('button');
                var del     = document.createElement('button');
                save.className = "save-btn-primary";
                save.id = (listProd[j].stockID + "SB");
                del.id = (listProd[j].stockID + "DB");
                del.className  = "del-btn-primary";
                del.onclick = function () {
                  deleteProd(this);
                };
                stock.contentEditable = true;
                desc.contentEditable  = true;
                price.contentEditable = true;
                stock.addEventListener("focus", function() {
                  this.setAttribute("data-initial-text", this.innerHTML);
                });
                desc.addEventListener("focus", function() {
                  this.setAttribute("data-initial-text", this.innerHTML);
                });
                price.addEventListener("focus", function() {
                  this.setAttribute("data-initial-text", this.innerHTML);
                });
                stock.addEventListener("blur", setSave);
                desc.addEventListener("blur", setSave);
                price.addEventListener("blur", setSave);
                if (j % 2 == 0) {
                  prodRow.className = "invBlocklt";
                }
                else {
                  prodRow.className = "invBlockdr"
                }
                stock.id   = "stckBlck";
                desc.id    = "descBlck";
                price.id   = "price";
                stock.innerHTML = listProd[j].stockID;
                desc.innerHTML  = listProd[j].title;
                price.innerHTML = listProd[j].price;
                prodRow.appendChild(stock);
                prodRow.appendChild(desc);
                prodRow.appendChild(price);
                prodRow.appendChild(del);
                prodRow.appendChild(save);
                mainW.appendChild(prodRow);
                ++numLines;
                prodRow.id = (listProd[j].stockID + "R");
                save.onclick = function () {
                  saveProd(this);
                };
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
        prodRow.id = i + "R";
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

function setSave () {
  if (this.getAttribute("data-initial-text") !== this.innerHTML) {
    var sbn = document.getElementById(this.parentNode.id.slice(0, -1) + "SB");
    sbn.className = "save-btn-warn";
    eleChanged = true;
  }
}

function deleteProd(id) {
    if(confirm("Confirm Delete")) {
      var ID = ((id.id.slice(0, -2)) + "R");
      var row = document.getElementById(ID);
      var list = jobj.Guide;
      for (var i = 0; i < list.length; i++) {
        var listCat = list[i].category;
        for (var k = 0; k < listCat.length; k++) {
          var listProd = listCat[k].products;
          if (listCat[k].name === currCat) {
            for (var j = 0; j < listProd.length; j++) {
              if (row.id.slice(0, -1) === listProd[j].stockID) {
                listProd.splice(j, 1);
                docChanged = true;
                document.getElementById("save-btn").className="btn btn-warning";
                document.getElementById(id.id.slice(0, -2) + "R").remove();
                --numLines;
              }
            }
          }
        }
      }
    }
    else {

    }
}

function addProd() {
  var prodRow = document.getElementById((numLines + "R"));
  ++numLines;
  var stock   = document.createElement('div');
  var desc    = document.createElement('div');
  var price   = document.createElement('div');
  var save    = document.createElement('button');
  var del     = document.createElement('button');
  save.id = (prodRow.id.slice(0, -1) + "SB");
  del.id = (prodRow.id.slice(0, -1) + "DB");
  save.className = "save-btn-primary";
  del.className  = "del-btn-primary";
  del.onclick = function () {
    deleteProd(this);
  };
  stock.contentEditable = true;
  desc.contentEditable  = true;
  price.contentEditable = true;
  stock.addEventListener("focus", function() {
    this.setAttribute("data-initial-text", this.innerHTML);
  });
  desc.addEventListener("focus", function() {
    this.setAttribute("data-initial-text", this.innerHTML);
  });
  price.addEventListener("focus", function() {
    this.setAttribute("data-initial-text", this.innerHTML);
  });
  stock.addEventListener("blur", setSave);
  desc.addEventListener("blur", setSave);
  price.addEventListener("blur", setSave);

  stock.id   = "stckBlck";
  desc.id    = "descBlck";
  price.id   = "price";
  prodRow.appendChild(stock);
  prodRow.appendChild(desc);
  prodRow.appendChild(price);
  prodRow.appendChild(del);
  prodRow.appendChild(save);
  mainW.appendChild(prodRow);
  ++numLines;
  save.onclick = function () {
    saveProd(this);
  };
}



