export const SITE = {
  title: 'Drupal State',
  description: 'Your website description.',
  defaultLanguage: 'en_US',
};

export const OPEN_GRAPH = {
  image: {
    src: 'https://github.com/snowpackjs/astro/blob/main/assets/social/banner.jpg?raw=true',
    alt:
      'astro logo on a starry expanse of space,' +
      ' with a purple saturn-like planet floating in the right foreground',
  },
  twitter: 'astrodotbuild',
};

export const KNOWN_LANGUAGES = {
  English: 'en',
};

// Uncomment this to add an "Edit this page" button to every page of documentation.
export const GITHUB_EDIT_URL = `https://git.drupalcode.org/project/drupal_state/-/tree/1.0.x/web/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
export const COMMUNITY_INVITE_URL = `https://www.drupal.org/project/drupal_state`;

// Uncomment this to enable site search.
// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// }

export const SIDEBAR = {
  en: [
    { text: 'Getting Started', header: true },
    { text: 'Introduction', link: 'en/introduction' },
    { text: 'Quick Start', link: 'en/quick-start' },
    { text: 'Beyond the Basics', link: 'en/beyond-basics' },

    { text: 'Why Use Drupal State?', header: true },
    { text: 'Getting Objects', link: 'en/getting-objects' },
    { text: 'Including Related Data', link: 'en/including-related-data' },
    { text: 'GraphQL Queries (Experimental)', link: 'en/graphql-queries' },
    { text: 'Authorization', link: 'en/authorization' },

    { text: 'Common Use Cases', header: true },
    { text: 'Getting Objects by Path', link: 'en/get-object-by-path' },
    { text: 'Getting Menu Items', link: 'en/getting-menu-items' },
    { text: 'Utilities', link: 'en/utilities' },

    { text: 'Project Direction', header: true },
    { text: 'Mission Statement', link: 'en/mission-statement' },
    { text: 'Ecosystem', link: 'en/ecosystem' },

    { text: 'Resources', header: true },
    {
      text: 'API Docs',
      link: 'en/api',
    },
    { text: 'Contributing', link: 'en/contributing' },
    {
      text: 'Project Repository',
      link: 'https://git.drupalcode.org/project/drupal_state',
      external: true,
    },
    {
      text: 'Issue Queue',
      link: 'https://www.drupal.org/project/issues/drupal_state',
      external: true,
    },
  ],
};
