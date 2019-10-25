$(function() {
    const webViewEl = $('#theView').get(0);

    function getHref(link) {
        return link.href.replace(/\{\}/g, $('#username').val());
    }

    function updateLinks() {
        const linksEl = $('#quicklinks').empty();

        LINKS.forEach(function (link) {
            const anchor = $('<a></a>').attr('href', '#').text(link.title).appendTo(linksEl);

            anchor.click(function() {
                visit(link, anchor);
                return false;
            });
        });
    }

    function visit(link, anchor) {
        $('#quicklinks .active').removeClass('active');
        anchor.addClass('active');

        // Send a message to the background script to show something else in the WebView
        // This is necessary to make the WebView be able to make a distinction between
        // tabbed navigation and in-page navigation.
        chrome.runtime.sendMessage({
            showInApp: getHref(link)
        });
    }

    // USERNAME
    // Not great code but only need to load this once, make sure
    // we don't get into an infinite loop.
    chrome.storage.local.get(['username'], function(values) {
        if (values.username) {
            $('#username').val(values.username);
        }

        $('#username').change(function() {
            chrome.storage.local.set({
                username: $(this).val()
            });
        });
    });

    updateLinks();
});
