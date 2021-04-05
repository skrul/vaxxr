chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == 'click') {
    xp(msg.xpath).click();
  }
  if (msg.action == 'check') {
    let el = xp(msg.xpath);
    el.checked = true;
    el.dispatchEvent(new Event('change', {"bubbles": true}));
  }
  if (msg.action == 'value') {
    let el = xp(msg.xpath);
    el.value = msg.value;
    el.dispatchEvent(new Event('change', {"bubbles": true}));
  }
  if (msg.action == 'select') {
    let el = xp(msg.xpath);
    let option = null;
    let index = null;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === msg.value) {
        option = el.options[i];
        index = i;
        break;
      }
    }
    el.selectedIndex = index;
    el.dispatchEvent(new Event('change', {"bubbles": true}));
  }
  if (msg.action == 'query') {
    let found = xp(msg.xpath) != null;
    sendResponse({found: found});
  }
  if (msg.action == 'mouseEvent') {
    let el = xp(msg.xpath);
    el.dispatchEvent(new MouseEvent(msg.event, {"bubbles": true}))
  }
  if (msg.action == 'log') {
    console.log(msg.log);
  }
});

function xp(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
}
