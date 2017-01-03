// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const jsfp   = './inventory.json';
const remote = require('electron').remote;
const {BrowserWindow} = require('electron').remote
const jobj   = require(jsfp); //(with path)
const fs     = require('fs');
const mainW = document.getElementById('mainWin');
var docChanged = false;
var eleChanged = false;
let editing = false;

var currCat;
var times = 0;
var numLines;
var loaded = false;
var eId;

let searchBar = document.getElementById("search-bar");
var prevText;
let targRow;
let trPrevClass;
let searchVal;

if (!loaded) {
  loaded = true;
  window.onload = function () {
    populateSide();
    populateNav();
  };
  searchBar.addEventListener("focus", function() {
  if(searchBar.value)
    this.setAttribute("data-initial-text", this.value);
});
searchBar.addEventListener("blur", removeHighlight);   


searchBar.addEventListener("keypress", function(e) {
  if (e.keyCode === 13) {
    if (targRow)
      targRow.className = trPrevClass;
    searchVal = searchBar.value;
    search();
  }
})

document.getElementById("settings-btn").addEventListener("click", function(e) {
  var shown = document.getElementById("cats");
  if (shown) {
    shown.id = "cats-hidden";
  }
  else {
    document.getElementById("cats-hidden").id = "cats";
  }
});

document.getElementById("close-search-btn").addEventListener("click", function(e) {
  searchBar.value = null;
  removeHighlight();
});

  document.getElementById("search-btn").addEventListener("click", function(e) {
  search();
});

document.getElementById("add-btn").addEventListener("click", function(e) {
    addProd();
});

document.getElementById("save-btn").addEventListener("click", function (e) {
  if (docChanged) {
  docChanged = false;
    this.className = "save-btn-main";
    var jsav = JSON.stringify(jobj, null, 2);
    fs.writeFile(jsfp, jsav, function (err) {
      if(err) {
            alert("An error ocurred updating the file"+ err.message);
            console.log(err);
            return;
      }
                    
      alert("The file has been succesfully saved");
 });
}
})
}

/*document.getElementById("close-btn").addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    if (docChanged || eleChanged) {
      if (confirm("Exit without saving?")) {
        window.close();
      }
    }
    else {
      window.close();
    }
});*/             


function removeHighlight () {
  if(this.value !== searchVal)
    targRow.className = trPrevClass;
}



function search () {
  if (searchBar.value) {
    targRow = document.getElementById((searchBar.value + "R").toUpperCase());
    trPrevClass = targRow.className;
    //targRow.scrollTo();
    targRow.className = "highlight";
  }
};

function populateNav() {
  var make = document.getElementById("slt-make");
  var type = document.getElementById("slt-type");
  var option = document.createElement('option');
  option.appendChild(document.createTextNode("HI"));
  make.appendChild(option);
};

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

var selector, elems, makeActive;
selector = (".prod li");

elems = document.querySelectorAll(selector);
alert(elems[0].innerHTML);
makeActive = function () {
    alert("HI");
    for (var i = 0; i < elems.length; i++)
        elems[i].className = "active";
        alert(elems[i]);

    this.className = "active";
};

for (var i = 0; i < elems.length; i++)
    elems[i].addEventListener('mousedown', makeActive);


function saveProd(id) {
    var found = false;   
    var list = jobj.Guide;
    var ID = id.id.slice(0, -2) + "R";
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
              docChanged = true;
              document.getElementById("save-btn").className="save-btn-warn";
              found = true;
            }
            else if ((j + 1) == listProd.length && !found) {
              listProd.splice(listProd.length, 1, {"stockID" : children[0].innerHTML, 
              "title" : children[1].innerHTML, "price" : children[2].innerHTML});
              docChanged = true;
              document.getElementById("save-btn").className="save-btn-warn";
              found = true;
            }
          }
        }
      }
    }
}

function fillProduct(eID) {
    eId = eID;
    searchBar.placeholder = "Search in " + eID + "...";
    const MAXLINES = 200;
    numLines = 0;
    var list = jobj.Guide;
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
                var qty     = document.createElement('div');
                var web     = document.createElement('button');
                var edit    = document.createElement('button');
                var del     = document.createElement('button');
                var form    = document.createElement('button');
                web.className  = "web-btn-primary";
                form.className = "form-btn-primary";
                web.id = (listProd[j].url);
                web.onclick = function () {
                  openAddr(this);
                };
                edit.className = "edit-btn-primary";
                edit.id = (listProd[j].stockID + "EB");
                form.id = (listProd[j].stockID + "FB");
                del.id = (listProd[j].stockID + "DB");
                del.className  = "del-btn-primary";
                del.onclick = function () {
                  deleteProd(this);
                };

                form.onclick = function () {
                  formControl(this);
                };
                
                if (j % 2 == 0) {
                  prodRow.className = "invBlocklt";
                }
                else {
                  prodRow.className = "invBlockdr"
                }
                stock.className   = "stock";
                desc.className    = "desc";
                price.className   = "price";
                qty.className     = "qty";
                prodRow.id        = listProd[j].stockID + "R";
                stock.id          = listProd[j].stockID + "S";
                desc.id           = listProd[j].stockID + "D";
                price.id          = listProd[j].stockID + "P";
                qty.id            = listProd[j].stockID + "Q";
                stock.innerHTML   = listProd[j].stockID;
                desc.innerHTML    = listProd[j].title;
                price.innerHTML   = listProd[j].price;
                qty.innerHTML     = listProd[j].qty;
                prodRow.appendChild(stock);
                prodRow.appendChild(desc);
                prodRow.appendChild(price);
                prodRow.appendChild(qty);
                prodRow.appendChild(del);
                prodRow.appendChild(edit);
                prodRow.appendChild(web);
                prodRow.appendChild(form);
                mainW.appendChild(prodRow);
                ++numLines;
                edit.setAttribute("status", false);
                edit.onclick = function () {
                  setEdit(this);
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
  elem.className = "active";
  fillProduct(elem.id);
}

function setEdit (ebtn) { 
  var status = ebtn.getAttribute("status");
  var stock  = document.getElementById(ebtn.id.slice(0, -2) + "S");
  var desc   = document.getElementById(ebtn.id.slice(0, -2) + "D");
  var price  = document.getElementById(ebtn.id.slice(0, -2) + "P");
  var qty    = document.getElementById(ebtn.id.slice(0, -2) + "Q");
  if (status === "false") {
    ebtn.className = "edit-btn-confirm";
    ebtn.setAttribute("status", true);
    stock.contentEditable = true;
    desc.contentEditable  = true;
    price.contentEditable = true;
    qty.contentEditable   = true;
    stock.setAttribute("orig-content", stock.innerHTML);
    desc.setAttribute("orig-content", desc.innerHTML);
    price.setAttribute("orig-content", price.innerHTML);
    qty.setAttribute("orig-content", qty.innerHTML);
  }
  else {
    ebtn.className = "edit-btn-primary";
    ebtn.setAttribute("status", false);
    stock.contentEditable = false;
    desc.contentEditable  = false;
    price.contentEditable = false;
    qty.contentEditable   = false;
    if (stock.getAttribute("orig-content") !== stock.innerHTML   ||
        desc.getAttribute("orig-content")  !== desc.innerHTML    ||
        price.getAttribute("orig-content") !== price.innerHTML   ||
        qty.getAttribute("orig-content")   !== qty.innerHTML) {
          saveProd(ebtn);
      }
  }
}

function removeElems (cName) {
  elems = document.getElementsByClassName(cName);
  while (elems.length > 0) {
    elems[0].parentNode.removeChild(elems[0]);
  }
}

function setSave () {
  if (this.getAttribute("data-initial-text") !== this.innerHTML) {
    saveProd(this);
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
                currCat = -1;
                fillProduct(eId);
              }
              else if ((j + 1) == listProd.length) {
                document.getElementById(id.id.slice(0, -2) + "R").remove();
                --numLines;
                currCat = -1;
                fillProduct(eId);
              }
            }
          }
        }
      }
    }
    else {

    }
}

// TODO : FIX AFTER FILLPRODUCT CHANGE
function addProd() {
  var prodRow = document.getElementById((numLines + "R"));
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


  stock.id   = "stckBlck";
  desc.id    = "descBlck";
  price.id   = "price";
  prodRow.appendChild(stock);
  prodRow.appendChild(desc);
  prodRow.appendChild(price);
  prodRow.appendChild(del);
  prodRow.appendChild(save);
  ++numLines;
  save.onclick = function () {
    saveProd(this);
  };
}

function openAddr(bID) {
};

function formFill() {
    alert("H");
    //var stock  = document.getElementById(fb.id.slice(0, -2) + "S");
    var stockForm = document.getElementById('stockText');
    document.getElementById("stockText").value = "HI";
    //stockForm.value = "HELLO";
}
function alertWin () {
  alert("HI");
};

function formControl (fb) {
  var rowDiv = document.getElementById((fb.id.slice(0, -2)) + "R");
  let rowChi = rowDiv.childNodes;
  rowDiv.className = ("invBlock-exp");
  let sTitle = document.createElement('div');
  sTitle.className = "textTitle";
  sTitle.appendChild(document.createTextNode("StockID"));
  let sTextArea = document.createElement('textarea');
  sTextArea.className = "textBox";
  sTextArea.value = rowChi[0].innerHTML;
  rowDiv.appendChild(sTitle);
  rowDiv.appendChild(sTextArea);
}



