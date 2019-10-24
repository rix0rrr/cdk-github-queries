chrome.app.runtime.onLaunched.addListener(function() {
    // chrome.tabs.create({url: chrome.extension.getURL('overview-page.html')});
    chrome.app.window.create('overview-page.html', {
        outerBounds: {
            width: 1024,
            height: 800
        }
    });
});
