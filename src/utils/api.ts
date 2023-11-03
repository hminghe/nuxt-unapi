import { join, relative } from 'pathe'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import type { ParseResult, ParserOptions } from '@babel/parser'
import traverse from '@babel/traverse'
import type { CallExpression, ExportNamedDeclaration, File, Function } from '@babel/types'
import type { NodePath } from '@babel/traverse'
import generator from '@babel/generator'
import type { Nuxt } from '@nuxt/schema'
import { globby } from 'globby'
import * as t from '@babel/types'
import { createResolver } from '@nuxt/kit'
import { joinURL, withLeadingSlash, withoutTrailingSlash } from 'ufo'
import type { ModuleOptions } from '../module'

interface ExportApi {
  name: string
  exportPath: NodePath<ExportNamedDeclaration | Function>
  defineApiPath: NodePath<CallExpression>
  // schemaName?: string
}

export function scanExportApis(ast: ParseResult<File>) {
  const exportApis: ExportApi[] = []
  // const exportVariables: string[] = []

  traverse(ast, {
    CallExpression(path) {
      const callee = path.get('callee')
      if (callee.isIdentifier({ name: 'defineApi' })) {
        const parentPath = path.parentPath
        if (parentPath.node.type === 'VariableDeclarator' && parentPath.node.id.type === 'Identifier') {
          const name = parentPath.node.id.name

          const exportPath = parentPath?.parentPath?.parentPath
          if (exportPath && exportPath.isExportNamedDeclaration()) {
            exportApis.push({
              name,
              exportPath,
              defineApiPath: path,
            })
          }
        }
      }
    },

  })

  return exportApis
}

export function transformClientApi(code: string, file: string, apiDirs: string[], options: ModuleOptions) {
  const ast = parseCode(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  })

  if (!ast) {
    return
  }

  // 遍历AST以查找import语句
  const exportApis = scanExportApis(ast)

  if (exportApis.length) {
    if (options.clientHandler.from) {
      const importClientHandlerStatement = t.importDeclaration(
        [t.importSpecifier(t.identifier(options.clientHandler.name), t.identifier(options.clientHandler.name))],
        t.stringLiteral(options.clientHandler.from)
      );
      ast.program.body.unshift(importClientHandlerStatement);
    }

    exportApis.forEach(({ name, defineApiPath }) => {
      const apiRoute = getApiRoute(apiDirs, file, name, options.routePrefix)!

      // 创建 setup 函数：(data) => apiPost("${url}", data)
      const clientApiArrowFunction = t.arrowFunctionExpression(
        [t.identifier('data')],
        t.callExpression(t.identifier(options.clientHandler.name), [t.stringLiteral(apiRoute), t.identifier('data')]),
      )

      defineApiPath.node.arguments = defineApiPath.node.arguments.map((v) => {
        if (v.type === 'ObjectExpression') {
          v.properties = v.properties
            .map((p) => {
              if (
                p.type === 'SpreadElement'
              || p.key.type !== 'Identifier'
              || !['setup', 'schema'].includes(p.key.name)
              ) {
                return null
              }

              if (p.key.name === 'setup') {
                return t.objectProperty(t.identifier('setup'), clientApiArrowFunction)
              }

              return p
            })
            .filter(p => p !== null)
        } else if (v.type === 'FunctionExpression' || v.type === 'ArrowFunctionExpression') {
          return clientApiArrowFunction
        }

        return v
      })
    })

    removeNotUsedImport(ast)

    const g = generator(ast)

    return {
      code: g.code,
      map: g.map,
    }
  }
}

// 删除未使用的 import
export function removeNotUsedImport(ast: ParseResult<File>) {
  const importSpecifiers = new Map()
  traverse(ast, {
    ImportDeclaration(path) {
      const { node } = path
      node.specifiers.forEach((specifier) => {
        if (t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier)) {
          importSpecifiers.set(specifier.local.name, {
            count: 0,
          })
        }
      })
    },
  })

  traverse(ast, {
    Identifier(path) {
      if (path.isReferencedIdentifier() && importSpecifiers.has(path.node.name)) {
        const s = importSpecifiers.get(path.node.name)
        s.count++
      }
    },
  })

  traverse(ast, {
    ImportDeclaration(path) {
      path.node.specifiers = path.node.specifiers.filter((specifier) => {
        return importSpecifiers.get(specifier.local.name)?.count > 0
      })

      if (path.node.specifiers.length === 0) {
        path.remove()
      }
    },
  })
}

export function getApiRoute(apiDirs: string[], file: string, name: string = '', prefix = '/') {
  let dir: string = ''
  let dirLength = 0
  apiDirs
    .map(v => relative(v, file))
    .filter(v => !v.startsWith('..'))
    .forEach((v) => {
      if (!dir || dirLength > v.length) {
        dir = v
        dirLength = dir.length
      }
    })

  if (dir) {
    dir = dir.replace(/\.ts$/, '').replace(/index$/, '').replace(/\\/g, '/')

    return withLeadingSlash(withoutTrailingSlash(joinURL(prefix, dir, name === 'index' ? '' : name)))
  }
}

export function getApiDirs(options: ModuleOptions, nuxt: Nuxt) {
  return getLayerDirs(nuxt, options.apiDir!)
}

export function getLayerDirs(nuxt: Nuxt, dir: string) {
  return nuxt.options._layers.map(c => join(c.config.rootDir, dir))
}

export async function scanFiles(dirs: string[]) {
  const files = await Promise.all(
    dirs.map(dir => scanDir(dir)),
  ).then(r => r.flat())

  return files
}

export async function scanDir(dir: string) {
  const fileNames = await globby('**/*.ts', {
    cwd: dir,
    dot: true,
    absolute: true,
  })
  return fileNames
    .map((fullPath) => {
      return {
        fullPath,
        path: relative(dir, fullPath),
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

export function generateServerApi(fullPath: string, fileRoute: string, options: ModuleOptions) {
  const resolver = createResolver(import.meta.url)

  if (!/^[a-z0-9\-_/]+$/i.test(fileRoute)) {
    return []
  }

  const ast = parseCode(readFileSync(fullPath, 'utf-8'))

  if (!ast) {
    return []
  }

  const apis = scanExportApis(ast)

  return apis.map((api) => {


    return ({
      route: withLeadingSlash(withoutTrailingSlash(joinURL(options.routePrefix, fileRoute, api.name === 'index' ? '' : api.name))),
      getContents: () => {
        const code = []
        code.push(`import { ${api.name} } from '${fullPath}';`)
        code.push(`import { defineServerApi } from '${resolver.resolve('../runtime/defineServerApi')}';`)
        const defineServerApiParams = [api.name]
        if (options.serverHandler) {
          defineServerApiParams.push(options.serverHandler.name)
          if (options.serverHandler.from) {
            code.push(`import { ${options.serverHandler.name} } from '${options.serverHandler.from}'`)
          }
        }

        code.push(`export default defineServerApi(${defineServerApiParams.join(',')});`)

        return code.join('\n')
      },
    })
  })
}

export function parseCode(code: string, options: ParserOptions = {
  sourceType: 'module',
  plugins: ['typescript'],
}) {
  try {
    return parse(code, options)
  } catch (error) {
    return null
  }
}
