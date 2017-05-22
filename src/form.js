function formControl(fb) {
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

    savebtn.onclick = function() {
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
    } else {
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
    destroyDesc(fb.id.slice(0, -2));
    closbtn.onclick = function() {
        mainW.style.overflow = "scroll";
        disabled = false;
        removeForm(rowDiv);
        resetRow(rowDiv);
        currCat = -1;
        fillProduct(eId);
    };
}

function removeForm(row) {
    formElems = row.childNodes;
    elemsLength = formElems.length;
    for (var i = 0; i < elemsLength; i++) {
        if (formElems[i].hasChildNodes) {
            chLength = formElems[i].childNodes.length;
            for (var j = 0; j < chLength; j++) {
                formElems[i].removeChild(formElems[i].childNodes[0]);
            }
        } else formElems[i].parentNode.removeChild(formElems[i]);
    }
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
                        document.getElementById("save-btn").className = "save-btn-warn";
                        found = true;
                    }
                }
            }
        }
    }
    successAlert("File ready to save");
}

function addTextListener(textArea) {
    textArea.addEventListener("focus", function() {
        textArea.setAttribute("orig-value", this.value);
    });

    textArea.addEventListener("blur", function() {
        if (this.value != this.getAttribute("orig-value")) {
            document.getElementById("form-save-btn-disabled").id = "form-save-btn-enabled";
        }
    });
}

function addCheckListener(checkBox) {
    checkBox.addEventListener("focus", function() {
        checkBox.setAttribute("orig-value", this.checked);
    });

    checkBox.addEventListener("click", function() {
        if (this.checked != this.getAttribute("orig-value")) {
            document.getElementById("form-save-btn-disabled").id = "form-save-btn-enabled";
        }
    });
}