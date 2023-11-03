import { addServerHandler, addServerImports, createResolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { debounce } from "perfect-debounce";
import type { ModuleOptions } from '../module'
import { generateServerApi, getApiDirs, getApiRoute, getLayerDirs, scanFiles } from '../utils/api'
import { watch } from "chokidar";
import { NitroConfig } from 'nitropack';

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

  addServerImportsUtilsDirs(nuxt)

  const apiDirs = getApiDirs(options, nuxt)

  const _loadHandlers = debounce(loadHandlers)

  const backupConfig: Pick<NitroConfig, 'virtual' | 'handlers'> = {
    virtual: {},
    handlers: [],
  }

  nuxt.hook('nitro:config', async (nitroConfig) => {

    if (!nitroConfig.plugins) {
      nitroConfig.plugins = []
    }

    backupConfig.virtual = { ...nitroConfig.virtual }
    backupConfig.handlers = [...nitroConfig.handlers]

    await _loadHandlers(nitroConfig, options, apiDirs)
  })



  nuxt.hook('nitro:build:before', (nitro) => {
    const watcher = watch(apiDirs, { ignoreInitial: true })
      .on('all', async () => {
        nitro.options.virtual = { ...backupConfig.virtual }
        nitro.options.handlers = [ ...backupConfig.handlers ]

        await _loadHandlers(nitro.options, options, apiDirs)
        nitro.vfs = nitro.options.virtual
        await nitro.hooks.callHook('rollup:reload')
      })

    nitro.hooks.hook("close", () => {
      watcher.close();
    });
  })
}

async function loadHandlers(nitroConfig: NitroConfig, options: ModuleOptions, apiDirs: string[]) {
  const files = await scanFiles(apiDirs)

  await Promise.all(files.map(async (file) => {
    const fileRoute = getApiRoute(apiDirs, file.fullPath)
    if (!fileRoute) {
      return
    }

    const apis = await generateServerApi(file.fullPath, fileRoute, options)
    apis.forEach((api) => {
      if (!nitroConfig.virtual) {
        nitroConfig.virtual = {}
      }
      if (!nitroConfig.virtual[`#unapi${api.route}`]) {
        nitroConfig.virtual[`#unapi${api.route}`] = api.getContents()
        nitroConfig.handlers.push({
          route: api.route,
          handler: `#unapi${api.route}`,
        })
      }
    })
  }))
}
