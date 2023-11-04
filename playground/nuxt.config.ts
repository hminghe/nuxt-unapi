export default defineNuxtConfig({
  modules: ['../src/module'],
  unapi: {

  },
  experimental: {
    asyncContext: true
  },
  devtools: { enabled: true }
})
