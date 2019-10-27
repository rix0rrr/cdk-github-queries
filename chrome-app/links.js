function encodeUriComponents(comps) {
    return Object.entries(comps).map(e => encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])).join('&');
}


function gitHubQuery(base, clauses) {
    return base + '?' + encodeUriComponents({
        utf8: '✓',
        q: clauses.join(' '),
    });
}

const pr = ["is:open", "is:pr", "archived:false"];
const issue = ["is:open", "is:issue", "archived:false"];
const ourRepos = ["repo:aws/jsii", "repo:aws/aws-cdk"];


// LINKS
const LINKS = [
    [
        { title: "Review", href: gitHubQuery("https://github.com/pulls/review-requested", [  "is:open", "archived:false", "label:contribution/core" ]) },
        { title: "Triage", href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", "-label:p0", "-label:p1", "-label:p2", "-label:p3"])},
        { title: "Shepherd", href: gitHubQuery("https://github.com/pulls", [...pr, "assignee:USERNAME", "-author:USERNAME" ])},
        { title: "Finish", href: "https://github.com/pulls" },
    ],
    [
        { title: "P", classes: "narrow" },
        ...[0, 1, 2, 3].map(p => (
            { title: p, href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", "label:p" + p, "-label:fix-ready" ]), classes: 'narrow' }
        ))
    ],
    [
        { title: "Small", href: gitHubQuery('https://github.com/issues', [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", "-label:fix-ready", "label:effort/small" ] ) },
        { title: "Non-bugs", href: gitHubQuery("https://github.com/issues/assigned", [...issue, ...ourRepos, "-label:bug"]) },
    ]
];
