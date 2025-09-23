import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    footer: defineCollection({
      type: 'data',
      source: 'data/footer.yml',
      schema: z.object({
        socials: z.array(z.object({
          icon: z.string(),
          url: z.string().url(),
        })),
        links: z.array(z.object({
          text: z.string(),
          url: z.string(),
        })),
        legal: z.object({
          copyright: z.string(),
        }),
      }),
    }),
    header: defineCollection({
      type: 'data',
      source: 'data/header.yml',
      schema: z.object({
        links: z.array(z.object({
          text: z.string(),
          url: z.string(),
          button: z.boolean().optional(),
          variant: z.enum(['primary', 'secondary']).optional(),
        })),
      }),
    }),
    wiki: defineCollection({
      type: 'page',
      source: 'wiki/**',
      schema: z.object({
        redirect: z.string().optional(),
      }),
    }),
    stagecraft: defineCollection({
      type: 'page',
      source: 'stagecraft/**',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        time: z.object({
          start: z.string(),
          end: z.string(),
        }),
        location: z.string().default('New Theatre'),
        cancelled: z.boolean().default(false),
        leaders: z.array(z.string()),
        category: z.string(),
        icon: z.string().optional(),
        materials: z.object({
          sessionPlan: z.string().url().optional(),
          supportingMaterials: z.array(z.object({
            title: z.string(),
            url: z.string().url(),
            type: z.enum(['document', 'presentation', 'video', 'folder']).optional(),
          })).optional(),
        }).optional(),
        prerequisites: z.array(z.string()).optional(),
        learning_outcomes: z.array(z.string()).optional(),
      }),
    }),
    pages: defineCollection({
      type: 'page',
      source: 'pages/**',
      schema: z.object({
        heroImage: z.string().optional(),
        heroImageAlt: z.string().optional(),
      }),
    }),
  },
})
