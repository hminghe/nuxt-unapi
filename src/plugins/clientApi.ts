import { createUnplugin } from 'unplugin'
import type { Nuxt } from '@nuxt/schema'
import { minimatch } from 'minimatch'
import { addBuildPlugin, addImports, createResolver } from '@nuxt/kit'

import type { ModuleOptions } from '../module'
import { getApiDirs, transformClientApi } from '../utils/api'
import { join } from 'pathe'

export function ClientApiPlugin(options: ModuleOptions, nuxt: Nuxt) {
  const apiDirs = getApiDirs(options, nuxt)
  return createUnplugin(() => {
    return {
      name: 'unplugin-unapi',
      enforce: 'pre',
      transformInclude(id) {
        return id.endsWith('ts') && apiDirs.some(dir => {
          return minimatch(id, join(dir, '**/*.ts'))
        })
      },
      transform(code, id) {
        return transformClientApi(code, id, apiDirs, options)
      },
    }
  })
}

export function clientApi(options: ModuleOptions, nuxt: Nuxt) {
  const resolver = createResolver(import.meta.url)
  addImports([
    {
      name: 'defineApi',
      from: resolver.resolve('../runtime/defineApi'),
    },
  ])

  if (!options.clientHandler) {
    options.clientHandler = {
      name: 'clientHandler',
      from: resolver.resolve('../runtime/clientHandler'),
    }
  }

  addBuildPlugin(ClientApiPlugin(options, nuxt))
}
