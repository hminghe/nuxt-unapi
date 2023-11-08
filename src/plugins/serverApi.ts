import { addServerHandler, addServerImports, addTemplate, updateTemplates } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../module'
import { generateServerApi, getLayerDirs } from '../utils/api'
import { join } from 'pathe';
import { resolver } from '../resolver';

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

  addServerImportsUtilsDirs(nuxt)

  addServerImports([
    {
      name: 'defineApi',
      from: resolver.resolve('./runtime/defineApi'),
    },
  ])

  addServerImports([
    {
      name: 'defineFormDataApi',
      from: resolver.resolve('./runtime/defineFormDataApi'),
    },
  ])

  const genServerFileName = 'server-unapi.ts'

  addTemplate({
    filename: genServerFileName,
    write: true,
    async getContents() {
      return generateServerApi(options, nuxt)
    }
  })

  addServerHandler({
    handler: join(nuxt.options.buildDir, genServerFileName),
    lazy: true,
    route: '/api/**'
  })

  nuxt.hook('builder:watch', async (event, path) => {
    if (path.startsWith(options.apiDir!)) {
      await updateTemplates({
        filter: (t) => t.filename === genServerFileName
      })
    }
  })
}
