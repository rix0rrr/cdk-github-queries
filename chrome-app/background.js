chrome.app.runtime.onLaunched.addListener(function() {
    // chrome.tabs.create({url: chrome.extension.getURL('overview-page.html')});
    chrome.app.window.create('overview-page.html', {
        outerBounds: {
            width: 1024,
            height: 800
        },
    }, function(createdWindow) {
        createdWindow.contentWindow.onload = function() { onApplicationWindowLoaded(createdWindow.contentWindow); }
    });

    function onApplicationWindowLoaded(appWindow) {
        let appNavigatingTo;
        const webViewEl = appWindow.document.getElementById('theView');

        // Intercept all non-app-triggered loads (i.e., user navigation) and direct it to a new browser tab.
        webViewEl.addEventListener('loadstart', function(event) {
            if (!event.url.startsWith('chrome-extension://') && event.url !== appNavigatingTo) {
                webViewEl.stop();
                open(event.url, '_blank').focus();
            }
        });

        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.showInApp) {
                appNavigatingTo = request.showInApp;
                webViewEl.src = appNavigatingTo;
            }
        });
    }
});
