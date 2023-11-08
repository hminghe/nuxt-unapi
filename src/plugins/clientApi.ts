import { createUnplugin } from 'unplugin'
import type { Nuxt } from '@nuxt/schema'
import { addBuildPlugin, addImports } from '@nuxt/kit'

import type { ModuleOptions } from '../module'
import { getApiDirs, transformClientApi } from '../utils/api'
import { resolver } from '../resolver'

export function ClientApiPlugin(options: ModuleOptions, nuxt: Nuxt) {
  const apiDirs = getApiDirs(options, nuxt)
  return createUnplugin(() => {
    return {
      name: 'unplugin-unapi',
      enforce: 'pre',
      transformInclude(id) {
        return id.endsWith('.ts') && apiDirs.some(dir => {
          return id.startsWith(dir)
        })
      },
      transform(code, id) {
        return transformClientApi(code, id, apiDirs, options)
      },
    }
  })
}

export function clientApi(options: ModuleOptions, nuxt: Nuxt) {

  const imports = ['defineApi', 'defineFormDataApi', ['zodFile', 'zod']]

  imports.forEach((value) => {
    if (typeof value === 'string') {
      value = [value, value]
    }

    addImports([
      {
        name: value[0],
        from: resolver.resolve(`./runtime/${value[1]}`),
      },
    ])
  })

  if (!options.clientHandler) {
    options.clientHandler = {
      name: 'clientHandler',
      from: resolver.resolve('./runtime/clientHandler'),
    }
  }

  addBuildPlugin(ClientApiPlugin(options, nuxt))
}
