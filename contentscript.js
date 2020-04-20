chrome.storage.local.get('injection', function (items) {
	 document.querySelector("body").insertAdjacentHTML("beforeend", items.injection)
    assignTextToTextareas(items.updateTextTo);
    chrome.storage.local.remove('injection');
});