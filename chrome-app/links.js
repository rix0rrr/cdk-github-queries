function encodeUriComponents(comps) {
  return Object.entries(comps).map(e => encodeURIComponent(e[0]) + '=' + encodeURIComponent(e[1])).join('&');
}


function gitHubQuery(base, clauses) {
  return base + '?' + encodeUriComponents({
    utf8: '✓',
    q: clauses.join(' '),
  });
}

const P_DESCRIPTIONS = {
  0: 'Catastrophic failure. Prevents significant usage for many/most customers.',
  1: 'Severe bug, shared by multiple customers. Blocks usage of construct library, major construct, or other large code-area.',
  2: 'Small/medium bug. Only affects edge-case or tertiary code area. Encountered, but not blocking small portion of user-base.',
};

const pr = ["is:open", "is:pr", "archived:false"];
const issue = ["is:open", "is:issue", "archived:false"];
const ourRepos = ["repo:aws/jsii", "repo:aws/aws-cdk"];
const hideInProgress = [ "-label:status/in-progress" ];
const sortByOldestFirst = [ "sort:created-asc" ];

// LINKS
const LINKS = [
  [
    {
      title: "Review",
      href: gitHubQuery("https://github.com/pulls", [ ...pr, "review-requested:USERNAME", "-review:approved" ]),
      description: "Pull requests waiting for your review."
    },
    {
      title: "Triage",
      href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", "-label:p0", "-label:p1", "-label:p2", "-label:p3"]),
      description: "Confirm issue class (bug/feature) and attach a priority (p0..p3)",
    },
    {
      title: "Shepherd",
      href: gitHubQuery("https://github.com/pulls", [...pr, "assignee:USERNAME", "-author:USERNAME", "review:required" ]),
      description: "Contributor pull requests you are responsible for reviewing and merging",
    },
    {
      title: "Finish",
      href: "https://github.com/pulls",
      description: "Your pull requests"
    },
  ],
  [
    { title: "P", classes: "narrow" },
    ...[0, 1, 2].map(p => (
        {
          title: p,
          href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", "label:p" + p, ...hideInProgress, ...sortByOldestFirst ]),
          classes: 'narrow',
          description: P_DESCRIPTIONS[p],
        }
    ))
  ],
  [
    {
      title: "Small",
      href: gitHubQuery('https://github.com/issues', [...issue, ...ourRepos, "assignee:USERNAME", "label:bug", ...hideInProgress, "label:effort/small", ...sortByOldestFirst ]),
      description: "Small bugs you might be able to take care of between the soup and the potatoes.",
    },
    {
      title: "Non-bugs",
      href: gitHubQuery("https://github.com/issues/assigned", [...issue, ...ourRepos, "-label:bug"]),
      description: "Feature requests and other issues.",
    },
  ]
];
