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
const ourRepos = ["repo:aws/jsii", "repo:aws/aws-cdk", "repo:aws/aws-cdk-rfcs", "repo:awslabs/cdk-ops", "repo:aws-samples/aws-cdk-examples"];
const hideInProgress = [ "-label:status/in-progress" ];
const sortByOldestFirst = [ "sort:created-asc" ];
const sortByRecentUpdates = [ "sort:updated-desc" ];

// LINKS
const LINKS = [
  [
    { title: "Triage", classes: "narrow" },
    {
      title: "B",
      href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", ...sortByOldestFirst,
        "label:bug",
        "-label:p0", "-label:p1", "-label:p2", "-label:p3" ,
      ]),
      description: "For bugs, label with priority",
    },
    {
      title: "F",
      href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", ...sortByOldestFirst,
        "-label:bug", "-label:guidance", // everything that's not guidance or bug is a feature (just to make sure we don't miss anything)
        "-label:effort/small", "-label:effort/medium", "-label:effort/large",
        "-label:management/tracking", // The tracking issues distract from things that need attention
      ]),
      description: "For bugs, label with priority",
    },
    {
      title: "G",
      href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", ...sortByOldestFirst,
        "label:guidance",
      ]),
      description: "Questions asked by users, refer them to Stack Overflow or Gitter if possible",
    }
  ],
  [
    {
      title: "Review",
      href: gitHubQuery("https://github.com/pulls", [ ...pr, "review-requested:USERNAME", "-review:approved" ]),
      description: "Pull requests waiting for your review."
    },
    {
      title: "Shepherd",
      href: gitHubQuery("https://github.com/pulls", [...pr, "assignee:USERNAME", "-author:USERNAME" ]),
      description: "PRs assigned to you",
    },
    {
      title: "Attention",
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
    { title: "Bugs", classes: "narrow" },
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
    { title: "Features", classes: "narrow" },
    ...['small', 'medium', 'large'].map(size => (
        {
          title: size[0].toUpperCase(),
          href: gitHubQuery("https://github.com/issues", [...issue, ...ourRepos, "assignee:USERNAME", "-label:bug", "-label:guidance", `label:effort/${size}`, ...hideInProgress, ...sortByOldestFirst ]),
          classes: 'narrow'
        }
    ))
  ],
  [
    {
      title: 'Workflow',
      href: 'https://github.com/aws/aws-cdk/wiki/Triage-Workflow'
    }
  ]
];
