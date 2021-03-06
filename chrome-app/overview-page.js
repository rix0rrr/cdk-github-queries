$(function() {
    const webViewEl = $('#theView').get(0);
    const unreadBoxEl = $('#unread');

    let lastOpenedUrl;

    function getHref(link) {
        return link.href.replace(/USERNAME/g, $('#username').val());
    }

    function updateLinks() {
        const linksEl = $('#quicklinks').empty();

        LINKS.forEach(linkGroup => {
            const groupEl = $('<div></div>').addClass('link-group').appendTo(linksEl);
            linkGroup.map(link => {
                let el;
                if (link.href) {
                    el = $('<a></a>')
                        .attr('href', '#')
                        .click(function() {
                            visit(link, el);
                            return false;
                        });
                } else {
                    el = $('<span></span>');
                }

                el.text(link.title).attr('title', link.description || '').addClass('header-el').addClass(link.classes || '').appendTo(groupEl)
            });
        });
    }

    function visit(link, anchor) {
        $('#quicklinks .active').removeClass('active');
        anchor.addClass('active');

        openInWebView(getHref(link));
    }

    $('#login-btn').click(function() {
        openInWebView('https://github.com/login');
    });

    unreadBoxEl.change(() => {
        if (lastOpenedUrl) {
            openInWebView(lastOpenedUrl);
        }
    });

    function openInWebView(url) {
        lastOpenedUrl = url;

        // Send a message to the background script to show something else in the WebView
        // This is necessary to make the WebView be able to make a distinction between
        // tabbed navigation and in-page navigation.
        chrome.runtime.sendMessage({
            showInApp: url,
            features: {
                unreadOnly: unreadBoxEl.prop('checked'),
            },
        });
    }

    // SETTINGS
    // Not great code but only need to load this once, make sure
    // we don't get into an infinite loop.
    chrome.storage.local.get(['username', 'unreadOnly'], function(values) {
        console.log(values);
        if (values.username) {
            $('#username').val(values.username);
        }
        unreadBoxEl.prop('checked', values.unreadOnly);

        $('#username').change(function() {
            chrome.storage.local.set({
                username: $(this).val(),
            });
        });

        unreadBoxEl.change(() => {
            chrome.storage.local.set({ unreadOnly: unreadBoxEl.prop('checked') });
        });
    });

    updateLinks();
});
