MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action == 'fill-myturn') {
        fill("https://myturn.ca.gov/", fillMyTurn, msg.form);
    }
    if (msg.action == 'fill-ccsf') {
        fill("https://www.primarybio.com/r/ccsf-public", fillCcsf, msg.form);
    }
});

function fill(url, filler, form) {
    chrome.tabs.create({
        url: url,
        active: true
    }, function(myTab) {
        function listener(tabId, changeInfo, tab) {
            if (tabId === myTab.id && changeInfo.status == 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                filler(myTab.id, form);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);
    })
}

function fillMyTurn(tabId, form) {
    wait(tabId, "//button[@data-testid='landing-page-continue']", function() {
        sendClick(tabId, "//button[@data-testid='landing-page-continue']");
        wait(tabId, "//input[@id='q-screening-18-yr-of-age']",
            function() {
                sendClick(tabId, "//input[@id='q-screening-18-yr-of-age']");
                sendClick(tabId, "//input[@id='q-screening-health-data']");
                sendClick(tabId, "//input[@id='q-screening-accuracy-attestation']");
                sendClick(tabId, "//input[@id='q-screening-privacy-statement']");
                sendClick(tabId, "//input[@id='q-screening-eligibility-age-range-50-64']");
                sendClick(tabId, "//input[@id='q-screening-underlying-health-condition-No']");
                sendClick(tabId, "//input[@id='q-screening-disability-No']");
    
                sendSelect(tabId, "//select[@id='q-screening-eligibility-industry']", "Communications and IT");
                sendSelect(tabId, "//select[@id='q-screening-eligibility-county']", "San Francisco");
                sendClick(tabId, "//button[@data-testid='continue-button']");
                wait(tabId, "//button[@data-testid='location-search-page-continue']",
                    function() {
                        sendValue(tabId, "//input[@id='location-search-input']", form.zip);
                        sendClick(tabId, "//button[@data-testid='location-search-page-continue']");
                    }
                );
            }
        );
    });
}

function fillCcsf(tabId, form) {
    wait(tabId, "//button[@data-test='submit']", function() {
        sendClick(tabId, "//button[@data-test='submit']");
        sendClick(tabId, "//input[starts-with(@name,'ca_resident') and @value='yes']");
        sendClick(tabId, "//input[starts-with(@name,'above_65') and @value='yes']");
        sendClick(tabId, "//input[starts-with(@name,'certify_eligibility') and @value='yes']");
        sendClick(tabId, "//input[starts-with(@name,'question1') and @value='arrive_by_car']");
        sendClick(tabId, "//button[@data-test='submit']");

        sendValue(tabId, "//input[@name='first_name']", form['first']);
        sendValue(tabId, "//input[@name='last_name']", form['last']);
        sendValue(tabId, "//input[@name='phone_number']", form['phone']);
        sendValue(tabId, "//input[@name='email']", form['email']);
        sendMouseEvent(tabId, "//div[starts-with(@class,'test-dob-month')]//input", "mousedown");
        sendClick(tabId, "//div[starts-with(@class,'test-dob-month')]//div[text()='" + MONTHS[form['dob-month'] - 1] + "']");
        sendMouseEvent(tabId, "//div[starts-with(@class,'test-dob-day')]//input", "mousedown");
        sendClick(tabId, "//div[starts-with(@class,'test-dob-day')]//div[text()='" + form['dob-day'] + "']");
        sendMouseEvent(tabId, "//div[starts-with(@class,'test-dob-year')]//input", "mousedown");
        sendClick(tabId, "//div[starts-with(@class,'test-dob-year')]//div[text()='" + form['dob-year'] + "']");
        sendClick(tabId, "//button[@data-test='submit']");

        wait(tabId, "//input[@name='address_1']", function() {
            sendValue(tabId, "//input[@name='address_1']", form['address']);
            sendValue(tabId, "//input[@name='city']", form['city']);
            sendValue(tabId, "//input[@name='state']", form['state']);
            sendValue(tabId, "//input[@name='postal_code']", form['zip']);
            sendMouseEvent(tabId, "//div[@id='gender_string']//input", "mousedown");
            sendClick(tabId, "//div[@id='gender_string']//div[text()='" + (form.gender == 'm' ? 'Male' : 'Female') + "']");
            sendClick(tabId, "//input[@name='prefer_not_to_disclose']");
            sendClick(tabId, "//button[@data-test='submit']");
        });
    });
}

function sendClick(tabId, xpath) {
    chrome.tabs.sendMessage(tabId, {action: "click", xpath: xpath});
}

function sendMouseEvent(tabId, xpath, event) {
    chrome.tabs.sendMessage(tabId, {action: "mouseEvent", xpath: xpath, event: event});
}

function sendCheck(tabId, xpath) {
    chrome.tabs.sendMessage(tabId, {action: "check", xpath: xpath});
}

function sendValue(tabId, xpath, value) {
    chrome.tabs.sendMessage(tabId, {action: "value", xpath: xpath, value: value});
}

function sendSelect(tabId, xpath, value) {
    chrome.tabs.sendMessage(tabId, {action: "select", xpath: xpath, value: value});
}

function sendLog(tabId, log) {
    console.log("send log "+ log);
    chrome.tabs.sendMessage(tabId, {action: "log", log: log});
}

function query(tabId, xpath, response) {
    return chrome.tabs.sendMessage(tabId, {action: "query", xpath: xpath}, response);
}

function wait(tabId, xpath, found) {
    let max = 50;
    let f = function() {
        query(tabId, xpath, function(response) {
            if (response.found == true) {
              found();
            } else {
              max = max - 1;
              if (max > 0) {
                setTimeout(f, 100);
            } else {
                let log = "xpath '" + xpath + "' not found in 5000ms";
                console.log(log);
                sendLog(tabId, log);
            }
        }
      });
    }
    setTimeout(f, 100);
}