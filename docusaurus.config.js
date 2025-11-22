import { themes as prismThemes } from 'prism-react-renderer';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '🪶 To be better than yesterday',
  tagline: 'Progress, not perfection',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'https://june0619.github.io',
  baseUrl: '/',
  organizationName: 'June0619',
  projectName: 'June0619.github.io',
  deploymentBranch: 'gh-pages',
  onBrokenLinks: 'throw',
  githubHost: 'github.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'TBBY',
        logo: {
          alt: 'Jiwoon\'s blog Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/June0619',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'About',
            items: [
              {
                label: '블로그 소개',
                to: '/',
              },
              {
                label: '개발자 프로필',
                to: '/blog/authors/june',
              },
            ],
          },
          {
            title: 'Contents',
            items: [
              { label: '블로그 홈', to: '/blog' },
              { label: '태그 모음', to: '/blog/tags' },
            ],
          },
          {
            title: 'Links',
            items: [
              { label: 'GitHub', href: 'https://github.com/June0619' },
            ],
          }
        ],
        copyright: 
          `© ${new Date().getFullYear()} To be better than yesterday. All rights reserved.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java'],
      },
    }),
};


export default config;