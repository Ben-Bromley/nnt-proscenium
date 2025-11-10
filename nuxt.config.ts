// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/seo',
    'nuxt-auth-utils',
  ],

  devtools: { enabled: true },

  css: ['~/assets/styles/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  content: {
    experimental: { sqliteConnector: 'native' },
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
    build: {
      markdown: {
        highlight: {
          theme: 'github-dark',
        },
      },
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'success', 'info', 'warning', 'error'],
      defaultVariants: {
        color: 'primary',
        size: 'md',
      },
      transitions: true,
    },
    prefix: 'U',
    fonts: true,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    experimental: {
      wasm: true,
    },
    cloudflare: {
      wrangler: {
        name: 'proscenium',
        routes: [
          {
            pattern: 'proscenium.newtheatre.org.uk',
            custom_domain: true,
          },
          {
            pattern: 'newtheatre.org.uk',
            custom_domain: true,
          },
        ],
        d1_databases: [
          {
            binding: 'DB',
            database_name: 'proscenium',
            database_id: '01a75263-87a9-452a-a4a0-b3b9db71dfe5',
          },
        ],
        observability: {
          logs: {
            enabled: true,
          },
        },
      },
    },
    routeRules: {
      '/mailing-list/': { redirect: 'https://newtheatre.us3.list-manage.com/subscribe?u=ce5311ce46fe45638f90f4022&id=97e4899eb8' },
    },
  },

  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js', // Ensure correct path for cloudflare builds
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  icon: {
    customCollections: [
      {
        prefix: 'icon',
        dir: './app/assets/icons',
      },
    ],
  },

  linkChecker: {
    enabled: true,
  },

  ogImage: {
    enabled: false,
  },

  robots: {
    enabled: true,
    blockNonSeoBots: true,
  },

  schemaOrg: {
    enabled: true,
    identity: {
      type: 'Organization',
      name: 'New Theatre',
      url: 'https://newtheatre.org.uk',
      description: 'We are the only entirely student-run theatre in England. Producing over thirty shows a year, they range from ‘A Midsummer Night’s Dream’ to contemporaries plays, as well as a host of original student written pieces.',
    },
  },

  seo: {
    // redirectToCanonicalSiteUrl: true,
    automaticDefaults: true,
  },

  sitemap: {
    enabled: true,
    autoLastmod: true,
  },
})
