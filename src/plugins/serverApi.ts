import { addServerHandler, addServerImports, addTemplate, createResolver, updateTemplates } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../module'
import { generateServerApi, getApiDirs, getApiRoute, getLayerDirs, scanFiles } from '../utils/api'
import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { join } from 'pathe';

function addServerImportsUtilsDirs(nuxt: Nuxt) {
  // 把 utils 目录加到 server 的自动导入去
  nuxt.hook('nitro:config', async (nitroConfig) => {
    const importsDirs = getLayerDirs(nuxt, 'utils')
    nitroConfig.imports = nitroConfig.imports || {}
    if (nitroConfig.imports.dirs) {
      nitroConfig.imports.dirs.push(...importsDirs)
    } else {
      nitroConfig.imports.dirs = importsDirs
    }
  })
}


export async function serverApi(options: ModuleOptions, nuxt: Nuxt) {
  const resolver = createResolver(import.meta.url)

  addServerImportsUtilsDirs(nuxt)

  addServerImports([
    {
      name: 'defineApi',
      from: resolver.resolve('../runtime/defineApi'),
    },
    {
      name: 'addApiInterceptor',
      from: resolver.resolve('../runtime/defineServerApi'),
    },
  ])

  addServerHandler({
    handler: join(nuxt.options.buildDir, 'server-unapi.ts'),
    lazy: true,
    route: '/api/**'
  })

  addTemplate({
    filename: 'server-unapi.ts',
    write: true,
    async getContents() {
      return generateServerApi(options, nuxt)
    }
  })

  nuxt.hook('builder:watch', async (event, path) => {
    if (path.startsWith(options.apiDir)) {
      await updateTemplates({
        filter: (t) => t.filename === 'server-unapi.ts'
      })
    }
  })
}
