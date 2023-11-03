import { defineNuxtModule } from '@nuxt/kit'

import { clientApi } from './plugins/clientApi'
import { serverApi } from './plugins/serverApi'


// Module options TypeScript interface definition
export interface ModuleOptions {
  apiDir?: string
  routePrefix?: string
  clientHandler?: {
    name: string
    from?: string
  }
  serverHandler?: {
    name: string
    from?: string 
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unapi',
    configKey: 'unapi'
  },

  // Default configuration options of the Nuxt module
  defaults: {
    apiDir: 'api',
    routePrefix: '/api',
  },

  setup (options, nuxt) {
    console.log('nuxt.options.watch', nuxt.options.watch)
    if (!nuxt.options.watch) {
      nuxt.options.watch = []
    }
    nuxt.options.watch.push('api')

    clientApi(options, nuxt)
    serverApi(options, nuxt)
  }
})
