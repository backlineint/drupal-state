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

// This is the type of the frontmatter you put in the docs markdown files.
export type Frontmatter = {
  title: string;
  description: string;
  layout: string;
  image?: { src: string; alt: string };
  dir?: 'ltr' | 'rtl';
  ogLocale?: string;
  lang?: string;
};

export const KNOWN_LANGUAGES = {
  English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

// Uncomment this to add an "Edit this page" button to every page of documentation.
export const GITHUB_EDIT_URL = `https://git.drupalcode.org/project/drupal_state/-/tree/1.0.x/web/`;

// Uncomment this to add an "Join our Community" button to every page of documentation.
export const COMMUNITY_INVITE_URL = `https://www.drupal.org/project/drupal_state`;

// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: 'XXXXXXXXXX',
//   appId: 'XXXXXXXXXX',
//   apiKey: 'XXXXXXXXXX',
// };

export type Sidebar = Record<
  typeof KNOWN_LANGUAGE_CODES[number],
  Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
  en: {
    'Getting Started': [
      { text: 'Introduction', link: 'en/introduction' },
      { text: 'Quick Start', link: 'en/quick-start' },
      { text: 'Beyond the Basics', link: 'en/beyond-basics' },
    ],
    'Why Use Drupal State?': [
      { text: 'Getting Objects', link: 'en/getting-objects' },
      { text: 'Including Related Data', link: 'en/including-related-data' },
      { text: 'Authorization', link: 'en/authorization' },
    ],
    'Common Use Cases': [
      { text: 'Getting Objects by Path', link: 'en/get-object-by-path' },
      { text: 'Getting Menu Items', link: 'en/getting-menu-items' },
      { text: 'Utilities', link: 'en/utilities' },
      { text: 'Error Handling', link: 'en/error-handling' },
    ],
    'Project Direction': [
      { text: 'Mission Statement', link: 'en/mission-statement' },
      { text: 'Ecosystem', link: 'en/ecosystem' },
    ],
    Resources: [
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
  },
};
