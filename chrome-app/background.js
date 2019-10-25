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

        function keepPageLoadInWebView(url) {
            return (url.startsWith('chrome-extension://')
                || url === appNavigatingTo
                || url === 'https://github.com/'
                || url.startsWith('https://github.com/login')
                || url.startsWith('https://github.com/session'));
        }


        // Intercept all non-app-triggered loads (i.e., user navigation) and direct it to a new browser tab.
        function makeNavigateHandler(eventType) {
            return function(event) {
                console.log('Navigating to', event.url, '(' + eventType + ')');
                if (!keepPageLoadInWebView(event.url)) {
                    console.log('Opening new tab');
                    webViewEl.stop();
                    open(event.url, '_blank').focus();
                } else {
                    // Loading in WebView. Insert some CSS to hide GitHub's top banner.
                    webViewEl.insertCSS({
                        runAt: 'document_start',
                        code: '.js-header-wrapper { display: none; }',
                    });
                }
            }
        }

        // In principle 'loadstart' should be enough, but I've gotten into a state
        // where 'loadstart' doesn't happen, but 'loadcommit' does. Maybe if the target
        // page is locally cached?
        webViewEl.addEventListener('loadstart', makeNavigateHandler('loadstart'));
        webViewEl.addEventListener('loadcommit', makeNavigateHandler('loadcommit'));

        // Handle messages from our webpage to navigate the WebView to a different
        // page. We do this so we can record which page we're navigating to explicitly
        // so we don't trigger the "open in new tab" behavior.
        chrome.runtime.onMessage.addListener(function(request, sender) {
            if (request.showInApp) {
                appNavigatingTo = request.showInApp;
                webViewEl.src = appNavigatingTo;
            }
        });
    }
});
