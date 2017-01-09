// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const jsfp   = './inventory.json';
const remote = require('electron').remote;
const {BrowserWindow} = require('electron').remote
const jobj   = require(jsfp); //(with path)
const fs     = require('fs');
const mainW = document.getElementById('mainWin');
const body  = document.getElementById('mainContainer');
var docChanged = false;
var eleChanged = false;
let editing = false;
let print = document.getElementById('print-btn');

var currCat;
var times = 0;
var numLines;
var loaded = false;
var eId;
var disabled = false;

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
    if (search() === false) {
      searchBar.className = "search-bar-err";
      setTimeout(function () {
        clearWarn();
      }, 2000);
    }
  }
})

print.addEventListener("click", function(e) {
  createPrintMenu();
}); 

function clearWarn(elem) {
  searchBar.className = "search-bar-primary";
}

document.getElementById("settings-btn").addEventListener("click", function(e) {
  var shown = document.getElementById("cats");
  if (shown) {
    shown.id = "cats-hidden";
  }
  else {
    document.getElementById("cats-hidden").id = "cats";
  }
  document.getElementById('sidebar').id = "sidebar-closed";
});

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
            warnAlert ("File save failed");
            console.log(err);
            return;
      }
                    
      successAlert ("File successfully saved");
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
  if(this.value !== searchVal) {
    targRow.className = trPrevClass;
    var targChildren = targRow.childNodes;
    for (var i = 4; i < targChildren.length; i++) {
      targChildren[i].removeAttribute("style");
    }
  }
}



function search () {
  if (searchBar.value) {
    let found = false;
    targRow = document.getElementById((searchBar.value + "R").toUpperCase());
    if (targRow !== null) {
      window.location.hash = targRow.id;
      successAlert (searchBar.value + " found!");
      trPrevClass = targRow.className;
      targRow.className = "highlight-row";
      for (var i = 4; i < targRow.childNodes.length; i++) {
        targRow.childNodes[i].style.color = "white";
      }
      found = true;
    }
    else {
      warnAlert (searchBar.value + " not found...");
    }
    return found;
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
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(listGuide.title));
    li.appendChild(div);
    div.className = "prodCat";
    var ul = document.createElement('ul');
    ul.id = "prod";
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
    var found = false;   
    var list = jobj.Guide;
    var ID = id.slice(0, -2) + "R";
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
              removeElems("invBlock-oos");
              removeElems("highlight-row");
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
                
                var fIcon   = document.createElement('i');
                var wIcon   = document.createElement('i');
                var eIcon   = document.createElement('i');
                var dIcon   = document.createElement('i');
                
                fIcon.className = "fa fa-toggle-down";
                wIcon.className = "fa fa-external-link";
                eIcon.className = "fa fa-pencil-square";
                dIcon.className = "fa fa-times";

                form.appendChild(fIcon);
                web.appendChild(wIcon);
                edit.appendChild(eIcon);
                del.appendChild(dIcon);

                web.className  = "web-btn-primary";
                form.className = "form-btn-primary";
                web.id = (listProd[j].stockID + "WB");
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
                if (listProd[j].inStock === false) {
                  prodRow.className = "invBlock-oos";
                }
                else if (j % 2 == 0) {
                  prodRow.className = "invBlocklt";
                }
                else {
                  prodRow.className = "invBlockdr"
                }

                prodRow.setAttribute("cls", prodRow.className);
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
                prodRow.setAttribute("notes", listProd[j].notes);
                prodRow.setAttribute("url", listProd[j].url);
                prodRow.setAttribute("instock", listProd[j].inStock);
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
    window.location.hash = "#anchor";
};

function setElem (elem) {
  if (!disabled) {
    removeActive();
    setActive(elem);
    fillProduct(elem.id);
  }
  else {
    warnAlert ("Form view open: Please close first...");
  }
}

function removeActive () {
  let active = document.getElementsByClassName('active-prod');
  for (let i = 0; i < active.length; i++) {
    active[i].className = "normal";
  }
  let activeCat = document.getElementsByClassName('active-prodCat');
  if (activeCat[0]) activeCat[0].className = "";
}

function setActive (elem) {
  var div = elem.parentNode.parentNode.childNodes[0];
  div.className = "active-prodCat";
  elem.childNodes[0].className = "active-prod";
}

function setEdit (ebtn) { 
  var status = ebtn.getAttribute("status");
  var stock  = document.getElementById(ebtn.id.slice(0, -2) + "S");
  var desc   = document.getElementById(ebtn.id.slice(0, -2) + "D");
  var price  = document.getElementById(ebtn.id.slice(0, -2) + "P");
  var qty    = document.getElementById(ebtn.id.slice(0, -2) + "Q");
  if (status === "false") {
    ebtn.className = "edit-btn-confirm";
    ebtn.childNodes[0].className = "fa fa-check-square";
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
    ebtn.childNodes[0].className = "fa fa-pencil-square";
    ebtn.setAttribute("status", false);
    stock.contentEditable = false;
    desc.contentEditable  = false;
    price.contentEditable = false;
    qty.contentEditable   = false;
    if (stock.getAttribute("orig-content") !== stock.innerHTML   ||
        desc.getAttribute("orig-content")  !== desc.innerHTML    ||
        price.getAttribute("orig-content") !== price.innerHTML   ||
        qty.getAttribute("orig-content")   !== qty.innerHTML) {
          saveProd(ebtn.id);
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
    saveProd(this.id);
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
    saveProd(this.id);
  };
}

function openAddr(bID) {
};

function formControl (fb) {
  mainW.style.overflow = "hidden";
  disabled = true;
  var rowDiv = document.getElementById((fb.id.slice(0, -2)) + "R");
  let rowChi = rowDiv.childNodes;
  rowDiv.className = ("invBlock-exp");
  window.location.hash = rowDiv.id;

  let iconContainer = document.createElement('div');
  iconContainer.className = "form-icons";

  let savebtn = document.createElement('i');
  let closbtn = document.createElement('i');

  savebtn.id = "form-save-btn-disabled";
  closbtn.id = "form-clos-btn";

  savebtn.className = "fa fa-floppy-o";
  closbtn.className = "fa fa-toggle-up";

  savebtn.setAttribute("rid", rowDiv.id + "S");

  savebtn.onclick = function () {
    if (savebtn.id === "form-save-btn-enabled") {
      saveForm(rowDiv);
      this.id = "form-save-btn-disabled";
    }
  };


  iconContainer.appendChild(savebtn);
  iconContainer.appendChild(closbtn);
  
  let sTitle = document.createElement('div');
  sTitle.className = "textTitle-small";
  sTitle.appendChild(document.createTextNode("StockID"));
  let sTextArea = document.createElement('textarea');
  sTextArea.className = "textBox-small";
  sTextArea.value = rowChi[0].innerHTML;
  addTextListener(sTextArea);

  let pTitle = document.createElement('div');
  pTitle.className = "textTitle-small";
  pTitle.appendChild(document.createTextNode("Price"));
  let pTextArea = document.createElement('textarea');
  pTextArea.className = "textBox-small";
  pTextArea.value = rowChi[2].innerHTML;
  addTextListener(pTextArea);

  let qTitle = document.createElement('div');
  qTitle.className = "textTitle-small";
  qTitle.appendChild(document.createTextNode("Quantity"));
  let qTextArea = document.createElement('textarea');
  qTextArea.className = "textBox-small";
  qTextArea.value = rowChi[3].innerHTML;
  addTextListener(qTextArea);

  let stTitle = document.createElement('div');
  stTitle.className = "textTitle-small";
  stTitle.appendChild(document.createTextNode("Stock"));
  let stCheckBox = document.createElement('input');
  stCheckBox.type = "checkbox";
  stCheckBox.className = "cbox";
  if (rowDiv.getAttribute('instock') == 'true') {
    stCheckBox.checked = true;
  }
  else {
    stCheckBox.checked = false;
  }
  addCheckListener(stCheckBox);

  let dTitle = document.createElement('div');
  dTitle.className = "textTitle-large";
  dTitle.appendChild(document.createTextNode("Description"));
  let dTextArea = document.createElement('textarea');
  dTextArea.className = "textBox-large";
  dTextArea.value = rowChi[1].innerHTML;
  addTextListener(dTextArea);
  
  let uTitle = document.createElement('div');
  uTitle.className = "textTitle-large";
  uTitle.appendChild(document.createTextNode("URL"));
  let uTextArea = document.createElement('textarea');
  uTextArea.className = "textBox-large";
  uTextArea.value = rowDiv.getAttribute("url");
  addTextListener(uTextArea);

  let nTitle = document.createElement('div');
  nTitle.className = "textTitle-large";
  nTitle.appendChild(document.createTextNode("Notes"));
  let nTextArea = document.createElement('textarea');
  nTextArea.className = "textBox-large";
  nTextArea.value = rowDiv.getAttribute("notes");
  addTextListener(nTextArea);
  
  let f_container = document.createElement('div');
  let s_container = document.createElement('div');
  let t_container = document.createElement('div');
  let fo_container = document.createElement('div');
  let st_container = document.createElement('div');

  f_container.className = "form-row";
  s_container.className = "form-row";
  t_container.className = "form-row";
  st_container.className = "form-row";
  fo_container.className = "form-row-large";

  let fr_container = document.createElement('div');
  let ft_container = document.createElement('div');
  fr_container.className = "form-row-large";
  ft_container.className = "form-row-large";
  
  
  f_container.appendChild(sTitle);
  f_container.appendChild(sTextArea);
  s_container.appendChild(pTitle);
  s_container.appendChild(pTextArea);
  t_container.appendChild(qTitle);
  t_container.appendChild(qTextArea); 
  st_container.appendChild(stTitle);
  st_container.appendChild(stCheckBox);
  fo_container.appendChild(uTitle);
  fo_container.appendChild(uTextArea);
  fr_container.appendChild(dTitle);
  fr_container.appendChild(dTextArea);
  ft_container.appendChild(nTitle);
  ft_container.appendChild(nTextArea);
  rowDiv.appendChild(iconContainer);
  rowDiv.appendChild(f_container);
  rowDiv.appendChild(s_container);
  rowDiv.appendChild(t_container);
  rowDiv.appendChild(st_container);
  rowDiv.appendChild(fr_container);
  rowDiv.appendChild(fo_container);
  rowDiv.appendChild(ft_container);
  destroyDesc (fb.id.slice(0, -2));
  closbtn.onclick = function () {
    mainW.style.overflow = "scroll";
    disabled = false;
    removeForm(rowDiv);
    resetRow(rowDiv);
    currCat = -1;
    fillProduct(eId);
  };
}

// TODO: USE FOR-LOOP
function destroyDesc (id) {
  var stock = document.getElementById(id + "S");
  var desc  = document.getElementById(id + "D");
  var price = document.getElementById(id + "P");
  var qty   = document.getElementById(id + "Q");
  var form  = document.getElementById(id + "FB");
  var web   = document.getElementById(id + "WB");
  var edit  = document.getElementById(id + "EB");
  var del   = document.getElementById(id + "DB");
  stock.parentNode.removeChild(stock);
  desc.parentNode.removeChild(desc);
  price.parentNode.removeChild(price);
  qty.parentNode.removeChild(qty);
  form.parentNode.removeChild(form);
  web.parentNode.removeChild(web);
  edit.parentNode.removeChild(edit);
  del.parentNode.removeChild(del);
}

function removeForm (row) {
  formElems = row.childNodes;
  elemsLength = formElems.length;
  for (var i = 0; i < elemsLength; i++) {
    if (formElems[i].hasChildNodes) {
      chLength = formElems[i].childNodes.length;
      for (var j = 0; j < chLength; j++) {
        formElems[i].removeChild(formElems[i].childNodes[0]);
      }
    }
     else formElems[i].parentNode.removeChild(formElems[i]);
  }
}

function resetRow (row) {
  row.className = row.getAttribute("cls");
}

function addTextListener(textArea) {
    textArea.addEventListener("focus", function () {
    textArea.setAttribute("orig-value", this.value);
  });

  textArea.addEventListener("blur", function () {
    if (this.value != this.getAttribute("orig-value")) {
      document.getElementById("form-save-btn-disabled").id = "form-save-btn-enabled";
    }
  }); 
}

function addCheckListener(checkBox) {
    checkBox.addEventListener("focus", function () {
    checkBox.setAttribute("orig-value", this.checked);
  });

  checkBox.addEventListener("click", function () {
    if (this.checked != this.getAttribute("orig-value")) {
      document.getElementById("form-save-btn-disabled").id = "form-save-btn-enabled";
    }
  }); 
}

function saveForm(row) {
    var found = false;   
    var list = jobj.Guide;
    for (var i = 0; i < list.length; i++) {
      var listCat = list[i].category;
      for (var k = 0; k < listCat.length; k++) {
        var listProd = listCat[k].products;
        if (listCat[k].name === currCat) {
          for (var j = 0; j < listProd.length; j++) {
            if (row.id.slice(0, -1) === listProd[j].stockID) {
              listProd[j].stockID = row.childNodes[1].childNodes[1].value;
              listProd[j].price = row.childNodes[2].childNodes[1].value;
              listProd[j].qty = row.childNodes[3].childNodes[1].value;
              listProd[j].inStock = row.childNodes[4].childNodes[1].checked;
              listProd[j].description = row.childNodes[5].childNodes[1].value;
              listProd[j].url = row.childNodes[6].childNodes[1].value;
              listProd[j].notes = row.childNodes[7].childNodes[1].value;
              docChanged = true;
              document.getElementById("save-btn").className="save-btn-warn";
              found = true;
            }
          }
        }
      }
    }
  successAlert ("File ready to save");
}

function warnAlert (message) {
  var location = document.getElementById('cats');
  var div = document.createElement('div');
  var textDiv = document.createElement('div');
  div.appendChild(textDiv);
  location.appendChild(div);
  setTimeout(function () {
    div.className = "alert-overlay-warn"; 
    textDiv.className = "alert-overlay-text";
    textDiv.innerHTML = (message);
  }, 500);
  setTimeout(function () {
    location.removeChild(div); 
  }, 2000);
};

function successAlert (message) {
  var location = document.getElementById('cats');
  var div = document.createElement('div');
  var textDiv = document.createElement('div');
  div.appendChild(textDiv);
  div.className = "alert-overlay-success"; 
  location.appendChild(div);
  setTimeout(function () {
    div.className = "alert-overlay-success"; 
    textDiv.className = "alert-overlay-text";
    textDiv.innerHTML = (message);
  }, 500);
  setTimeout(function () {
    location.removeChild(div); 
  }, 4000);
};

function createPrintMenu () {
  var printMenu = document.createElement('div');
  printMenu.className = "print-menu";
  body.appendChild(printMenu);
}