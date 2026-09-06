// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NUXT_E2E !== 'true' },
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

  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  css: ['~/assets/styles/main.scss'],
})
