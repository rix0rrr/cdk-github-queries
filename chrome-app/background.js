chrome.app.runtime.onLaunched.addListener(function() {
    // chrome.tabs.create({url: chrome.extension.getURL('overview-page.html')});
    chrome.app.window.create('overview-page.html', {
        outerBounds: {
            width: 1200,
            height: 800
        },
    }, function(createdWindow) {
        createdWindow.contentWindow.onload = function() { onApplicationWindowLoaded(createdWindow.contentWindow); }
    });

    function onApplicationWindowLoaded(appWindow) {
        let appNavigatingTo;
        let navigationFeatures = {};
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
                    webViewEl.stop();
                    openTab(event.url);
                } else {
                    // Loading in WebView. Insert some CSS to hide GitHub's top banner.
                    webViewEl.insertCSS({
                        runAt: 'document_start',
                        code: gitHubCssToInject()
                    });
                }
            }
        }

        function gitHubCssToInject() {
            const lines = [
                '.js-header-wrapper { display: none; }',
            ];

            if (navigationFeatures.unreadOnly) {
                lines.push(
                    '.js-issue-row { display: none; }',
                    '.js-issue-row.unread { display: block; }',
                );
            }

            return lines.join('\n');
        }

        let alreadyOpened;
        function openTab(url) {
            // Prevent double opens if both 'loadstart' and 'loadcommit' fire
            // in quick succession.
            if (alreadyOpened === url) { return; }

            console.log('Opening new tab');
            open(url, '_blank').focus();
            alreadyOpened = url;
            setTimeout(function() {
                alreadyOpened = undefined;
            }, 500);

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
                navigationFeatures = request.features || {};
                webViewEl.src = appNavigatingTo;
            }
        });
    }
});
