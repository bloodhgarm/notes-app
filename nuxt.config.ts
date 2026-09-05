// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Заметки и задачи',
      meta: [
        {
          name: 'description',
          content: 'Приложение для заметок и списка задач',
        },
      ],
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@pinia/nuxt',
  ],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  css: ['~/assets/styles/main.scss'],
})
