export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: false },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'HalalScan - Vérifie un produit en un scan',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            "Scanne le code-barres d'un produit pour repérer les ingrédients douteux ou non-halal, à partir des données publiques Open Food Facts.",
        },
        { name: 'theme-color', content: '#0B1310' },
      ],
    },
  },
})
