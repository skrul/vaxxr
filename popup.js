document.getElementById("myturn").addEventListener("click", function() {
    chrome.runtime.sendMessage({action: "fill-myturn", form: formMap()});
});

document.getElementById("ccsf").addEventListener("click", function() {
    chrome.runtime.sendMessage({action: "fill-ccsf", form: formMap()});
});

document.forms["form"].addEventListener("change", function() {
    save();
});

function load() {
    let a = Array.from(document.forms["form"].getElementsByTagName("input"));
    let keys = a.map(el => el.name);
    let inputs = {};
    for (const el of a) {
        inputs[el.name] = el;
    }

    chrome.storage.local.get(keys, function(result) {
        console.log(result);
        for(const key in result) {
            inputs[key].value = result[key];
        }
    }); 
}

function save() {
    chrome.storage.local.set(formMap());
}

function formMap() {
    let a = Array.from(document.forms["form"].getElementsByTagName("input"));
    let map = {};
    for (const el of a) {
        map[el.name] = el.value;
    }
    return map;
}

load();
