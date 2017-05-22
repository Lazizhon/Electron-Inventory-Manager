// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const jsfp = './data/inventory.json';
var XLSX = require('xlsx')
const jsonXlsx = require('icg-json-to-xlsx');
const remote = require('electron').remote;
const { BrowserWindow } = require('electron').remote
const jobj = require(jsfp); //(with path)
const fs = require('fs');
const mainW = document.getElementById('mainWin');
const body = document.getElementById('mainContainer');
var docChanged = false;
var eleChanged = false;
let editing = false;
let print = document.getElementById('print-btn');
var pathname;

const ipc = require('electron').ipcRenderer


var guideList = [];
var currCat;
var times = 0;
var numLines;
var loaded = false;
var eId;
var disabled = false;
var prevText;

if (!loaded) {
    loaded = true;
    window.onload = function() {
        populateSide();
        populateNav();
    };

    print.addEventListener("click", function(e) {
        createPrintMenu();
    });

    document.getElementById("settings-btn").addEventListener("click", function(e) {

    });

    document.getElementById("add-btn").addEventListener("click", function(e) {
        addProd();
    });

    document.getElementById("save-btn").addEventListener("click", function(e) {
        if (docChanged) {
            docChanged = false;
            this.className = "save-btn-main";
            var jsav = JSON.stringify(jobj, null, 2);
            fs.writeFile(jsfp, jsav, function(err) {
                if (err) {
                    warnAlert("File save failed");
                    console.log(err);
                    return;
                }

                successAlert("File successfully saved");
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


function populateNav() {
    var make = document.getElementById("slt-make");
    var type = document.getElementById("slt-type");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode(""));
    make.appendChild(option);
};

function populateSide() {
    var list = jobj.Guide;
    var cat = document.getElementById('cat');
    for (var i = 0; i < list.length; i++) {
        var listGuide = list[i];
        guideList.push(list[i].title);
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
            a.onclick = function() {
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
                        document.getElementById("save-btn").className = "save-btn-warn";
                        found = true;
                    } else if ((j + 1) == listProd.length && !found) {
                        listProd.splice(listProd.length, 1, {
                            "stockID": children[0].innerHTML,
                            "title": children[1].innerHTML,
                            "price": children[2].innerHTML
                        });
                        docChanged = true;
                        document.getElementById("save-btn").className = "save-btn-warn";
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
                    var stock = document.createElement('div');
                    var desc = document.createElement('div');
                    var price = document.createElement('div');
                    var qty = document.createElement('div');

                    var web = document.createElement('button');
                    var edit = document.createElement('button');
                    var del = document.createElement('button');
                    var form = document.createElement('button');

                    var fIcon = document.createElement('i');
                    var wIcon = document.createElement('i');
                    var eIcon = document.createElement('i');
                    var dIcon = document.createElement('i');

                    fIcon.className = "fa fa-toggle-down";
                    wIcon.className = "fa fa-external-link";
                    eIcon.className = "fa fa-pencil-square";
                    dIcon.className = "fa fa-times";

                    form.appendChild(fIcon);
                    web.appendChild(wIcon);
                    edit.appendChild(eIcon);
                    del.appendChild(dIcon);

                    web.className = "web-btn-primary";
                    form.className = "form-btn-primary";
                    web.id = (listProd[j].stockID + "WB");
                    web.onclick = function() {
                        openAddr(this);
                    };
                    edit.className = "edit-btn-primary";
                    edit.id = (listProd[j].stockID + "EB");
                    form.id = (listProd[j].stockID + "FB");
                    del.id = (listProd[j].stockID + "DB");
                    del.className = "del-btn-primary";
                    del.onclick = function() {
                        deleteProd(this);
                    };

                    form.onclick = function() {
                        formControl(this);
                    };
                    if (listProd[j].inStock === false) {
                        prodRow.className = "invBlock-oos";
                    } else if (j % 2 == 0) {
                        prodRow.className = "invBlocklt";
                    } else {
                        prodRow.className = "invBlockdr"
                    }

                    prodRow.setAttribute("cls", prodRow.className);
                    stock.className = "stock";
                    desc.className = "desc";
                    price.className = "price";
                    qty.className = "qty";
                    prodRow.id = listProd[j].stockID + "R";
                    stock.id = listProd[j].stockID + "S";
                    desc.id = listProd[j].stockID + "D";
                    price.id = listProd[j].stockID + "P";
                    qty.id = listProd[j].stockID + "Q";
                    stock.innerHTML = listProd[j].stockID;
                    desc.innerHTML = listProd[j].title;
                    price.innerHTML = listProd[j].price;
                    qty.innerHTML = listProd[j].qty;
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
                    edit.onclick = function() {
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
            } else {
                prodRow.className = "invBlockdr";
            }
            prodRow.id = i + "R";
            mainW.appendChild(prodRow);
        }
    }
    window.location.hash = "#anchor";
};

function setElem(elem) {
    if (!disabled) {
        removeActive();
        setActive(elem);
        fillProduct(elem.id);
    } else {
        warnAlert("Form view open: Please close first...");
    }
}



function setEdit(ebtn) {
    var status = ebtn.getAttribute("status");
    var stock = document.getElementById(ebtn.id.slice(0, -2) + "S");
    var desc = document.getElementById(ebtn.id.slice(0, -2) + "D");
    var price = document.getElementById(ebtn.id.slice(0, -2) + "P");
    var qty = document.getElementById(ebtn.id.slice(0, -2) + "Q");
    if (status === "false") {
        ebtn.className = "edit-btn-confirm";
        ebtn.childNodes[0].className = "fa fa-check-square";
        ebtn.setAttribute("status", true);
        stock.contentEditable = true;
        desc.contentEditable = true;
        price.contentEditable = true;
        qty.contentEditable = true;
        stock.setAttribute("orig-content", stock.innerHTML);
        desc.setAttribute("orig-content", desc.innerHTML);
        price.setAttribute("orig-content", price.innerHTML);
        qty.setAttribute("orig-content", qty.innerHTML);
    } else {
        ebtn.className = "edit-btn-primary";
        ebtn.childNodes[0].className = "fa fa-pencil-square";
        ebtn.setAttribute("status", false);
        stock.contentEditable = false;
        desc.contentEditable = false;
        price.contentEditable = false;
        qty.contentEditable = false;
        if (stock.getAttribute("orig-content") !== stock.innerHTML ||
            desc.getAttribute("orig-content") !== desc.innerHTML ||
            price.getAttribute("orig-content") !== price.innerHTML ||
            qty.getAttribute("orig-content") !== qty.innerHTML) {
            saveProd(ebtn.id);
        }
    }
}

function removeElems(cName) {
    elems = document.getElementsByClassName(cName);
    while (elems.length > 0) {
        elems[0].parentNode.removeChild(elems[0]);
    }
}

function setSave() {
    if (this.getAttribute("data-initial-text") !== this.innerHTML) {
        saveProd(this.id);
    }
}


function deleteProd(id) {
    if (confirm("Confirm Delete")) {
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
                            document.getElementById("save-btn").className = "btn btn-warning";
                            document.getElementById(id.id.slice(0, -2) + "R").remove();
                            --numLines;
                            currCat = -1;
                            fillProduct(eId);
                        } else if ((j + 1) == listProd.length) {
                            document.getElementById(id.id.slice(0, -2) + "R").remove();
                            --numLines;
                            currCat = -1;
                            fillProduct(eId);
                        }
                    }
                }
            }
        }
    } else {

    }
}

// TODO : FIX AFTER FILLPRODUCT CHANGE
function addProd() {
    var prodRow = document.getElementById((numLines + "R"));
    var stock = document.createElement('div');
    var desc = document.createElement('div');
    var price = document.createElement('div');
    var save = document.createElement('button');
    var del = document.createElement('button');
    save.id = (prodRow.id.slice(0, -1) + "SB");
    del.id = (prodRow.id.slice(0, -1) + "DB");
    save.className = "save-btn-primary";
    del.className = "del-btn-primary";
    del.onclick = function() {
        deleteProd(this);
    };


    stock.id = "stckBlck";
    desc.id = "descBlck";
    price.id = "price";
    prodRow.appendChild(stock);
    prodRow.appendChild(desc);
    prodRow.appendChild(price);
    prodRow.appendChild(del);
    prodRow.appendChild(save);
    ++numLines;
    save.onclick = function() {
        saveProd(this.id);
    };
}

function openAddr(bID) {};


// TODO: USE FOR-LOOP
function destroyDesc(id) {
    var stock = document.getElementById(id + "S");
    var desc = document.getElementById(id + "D");
    var price = document.getElementById(id + "P");
    var qty = document.getElementById(id + "Q");
    var form = document.getElementById(id + "FB");
    var web = document.getElementById(id + "WB");
    var edit = document.getElementById(id + "EB");
    var del = document.getElementById(id + "DB");
    stock.parentNode.removeChild(stock);
    desc.parentNode.removeChild(desc);
    price.parentNode.removeChild(price);
    qty.parentNode.removeChild(qty);
    form.parentNode.removeChild(form);
    web.parentNode.removeChild(web);
    edit.parentNode.removeChild(edit);
    del.parentNode.removeChild(del);
}



function resetRow(row) {
    row.className = row.getAttribute("cls");
}





function warnAlert(message) {
    var location = document.getElementById('cats');
    var div = document.createElement('div');
    var textDiv = document.createElement('div');
    div.appendChild(textDiv);
    location.appendChild(div);
    setTimeout(function() {
        div.className = "alert-overlay-warn";
        textDiv.className = "alert-overlay-text";
        textDiv.innerHTML = (message);
    }, 500);
    setTimeout(function() {
        location.removeChild(div);
    }, 2000);
};

function successAlert(message) {
    var location = document.getElementById('cats');
    var div = document.createElement('div');
    var textDiv = document.createElement('div');
    div.appendChild(textDiv);
    div.className = "alert-overlay-success";
    location.appendChild(div);
    setTimeout(function() {
        div.className = "alert-overlay-success";
        textDiv.className = "alert-overlay-text";
        textDiv.innerHTML = (message);
    }, 500);
    setTimeout(function() {
        location.removeChild(div);
    }, 4000);
};



function createPrintMenu() {
    var printMenu = document.createElement('div');
    printMenu.className = "print-menu";
    var iconContainer = document.createElement('div');
    iconContainer.className = "xport-icon-container";
    var iconText = document.createElement('div');
    iconText.className = "icon-text";
    iconText.innerHTML = "Export for Excel";
    var xclIcon = document.createElement('i');
    xclIcon.className = 'fa fa-file-excel-o';
    xclIcon.id = 'xcelIcon';

    xclIcon.addEventListener('click', function(event) {
        saveOptionMenu(printMenu);
    });

    iconContainer.appendChild(iconText);
    iconContainer.appendChild(xclIcon);

    var iconContainer2 = document.createElement('div');
    iconContainer2.className = "xport-icon-container";
    var iconText2 = document.createElement('div');
    iconText2.className = "icon-text";
    iconText2.innerHTML = "Export to PDF";
    var PDFIcon = document.createElement('i');
    PDFIcon.className = 'fa fa-file-pdf-o';
    PDFIcon.id = 'pdf-icon';
    PDFIcon.onclick = function() {

    }

    var exitBtn = document.createElement('i');
    exitBtn.id = "print-menu-exit";
    exitBtn.className = 'fa fa-times';
    exitBtn.onclick = function() {
        removeMenu(printMenu);
    };

    iconContainer2.appendChild(iconText2);
    iconContainer2.appendChild(PDFIcon);

    printMenu.appendChild(iconContainer);
    printMenu.appendChild(iconContainer2);
    printMenu.appendChild(exitBtn);
    body.appendChild(printMenu);
}

function saveToXLXS(guideName) {
    var wb, guide = jobj.Guide;
    alert(guideName);
    for (var i = 0; i < guide.length; i++) {
        var wb;
        if (guide[i].title === guideName) {
            wb = createWorkbookFromJSON(guide[i]);
            XLSX.writeFile(wb, pathname + '.xlsx');
            break;
        }
    }
    successAlert("Successfully created guide");
};

function saveOptionMenu(parentMenu) {
    var opMenu = document.createElement('div');
    opMenu.id = "sv-op-mnu";
    opMenu.className = "save-option-menu";

    var guideSelector = document.createElement('select');
    guideSelector.id = "sv-op-slt";
    guideSelector.className = "save-selector";

    var guideOp = document.createElement('option');
    guideSelector.appendChild(guideOp);
    guideSelector.value = null;

    for (var i = 0; i < guideList.length; i++) {
        guideOp = document.createElement('option');
        guideOp.value = guideList[i];
        guideOp.innerHTML = guideList[i];
        guideSelector.appendChild(guideOp);
    }

    var svBtn = document.createElement('i');
    svBtn.id = "sv-op-sv-btn-disabled";
    svBtn.className = "fa fa-floppy-o";

    svBtn.onclick = function() {
        if (this.id === "sv-op-sv-btn-enabled") {
            ipc.send('save-dialog');
        } else {
            warnAlert("Select guide above to save");
        }
    };

    var exBtn = document.createElement('i');
    exBtn.id = "sv-op-ex-btn";
    exBtn.className = "fa fa-times";

    exBtn.onclick = function() {
        removeMenu(exBtn.parentNode);
    }

    guideSelector.onchange = function() {
        if (document.getElementById('sv-op-sv-btn-enabled')) {
            var saveBtn = document.getElementById('sv-op-sv-btn-enabled');
        } else {
            var saveBtn = document.getElementById('sv-op-sv-btn-disabled')
        }
        if (guideSelector.options[guideSelector.selectedIndex].value.length > 0) {
            if (saveBtn.id === "sv-op-sv-btn-disabled") {
                saveBtn.id = "sv-op-sv-btn-enabled";
            }
        } else {
            saveBtn.id = "sv-op-sv-btn-disabled";
        }
    };

    opMenu.appendChild(guideSelector);
    opMenu.appendChild(svBtn);
    opMenu.appendChild(exBtn);

    parentMenu.appendChild(opMenu);
}

function createWorkbookFromJSON(guide) {
    var wb = {}
    wb.Sheets = {};
    wb.Props = {};
    wb.SSF = {};
    wb.SheetNames = [];
    var jCat = guide.category;
    for (var i = 0; i < jCat.length; i++) {
        var data = [
            ["stockID", "title", "price", "qty", "location"]
        ];
        var ws_name = jCat[i].name;
        var jProd = jCat[i].products;
        for (var j = 0; j < jProd.length; j++) {
            var pAttr = [jProd[j].stockID, jProd[j].title, jProd[j].price, jProd[j].qty, jProd[j].location];
            data.push(pAttr);
        }
        var ws = {}

        /* the range object is used to keep track of the range of the sheet */
        var range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

        /* Iterate through each element in the structure */
        for (var R = 0; R != data.length; ++R) {
            if (range.e.r < R) range.e.r = R;
            for (var C = 0; C != data[R].length; ++C) {
                if (range.e.c < C) range.e.c = C;

                /* create cell object: .v is the actual data */
                var cell = { v: data[R][C] };
                if (cell.v == null) continue;

                /* create the correct cell reference */
                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                /* determine the cell type */
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else cell.t = 's';

                /* add to structure */
                ws[cell_ref] = cell;
            }
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        /* add worksheet to workbook */
        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;
    }
    return wb;
};

function createPDF() {

}

ipc.on('saved-file', function(event, path) {
    var guideSelector = document.getElementById('sv-op-slt');
    if (!path) {
        pathname = './' + guideSelector.options[guideSelector.selectedIndex].value;
    } else {
        pathname = path;
    }
    saveToXLXS(guideSelector.options[guideSelector.selectedIndex].value);
});

function removeMenu(menu) {
    menuChildren = menu.childNodes;
    for (var i = 0; i < menuChildren.length; i++) {
        menuChildren[i].parentNode.removeChild(menuChildren[i]);
    }
    menu.parentNode.removeChild(menu);
    currCat = -1;
    fillProduct(eId);
}