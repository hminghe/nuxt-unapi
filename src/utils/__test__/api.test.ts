import { expect, test } from 'vitest'
import { parse } from '@babel/parser'
import type { Nuxt } from 'nuxt/schema'
import { getApiRoute, getLayerDirs, scanExportApis, transformClientApi } from '../api'

// test('scanExportApis', () => {
//   const ast = parse(`
//   export const aSchema = z.object({
//     test: z.string(),
//     name: z.string(),
//   }).partial({
//     test: true,
//   })

//   export function a(data) {
//     return data
//   }

//   export const a1 = () => 1;

//   function a2 () {

//   }

//   export const b = () => 123, c = '123', d = function (test) { console.log(test) }, e = (test4) => { console.log(test4) };
//   `, {
//     sourceType: 'module',
//     plugins: ['typescript'],
//   })

//   const apis = scanExportApis(ast)

//   expect(apis.map(v => v.name)).toEqual(['a', 'a1', 'b', 'd', 'e'])

//   expect(apis.map(v => !!v.schemaName)).toEqual([true, false, false, false, false])
// })

test('scanExportApis-defineApi', () => {
  const ast = parse(`
  export const test = 123;
  export const a = defineApi({
    setup() {
      return 123
    },
  })

  export const b = () => {
    const c = defineApi({
      setup() {
        return 123
      },
    })
  }
  `, {
    sourceType: 'module',
    plugins: ['typescript'],
  })

  const apis = scanExportApis(ast)

  expect(apis.map(v => v.name)).toEqual(['a'])
})

test('getApiRoute', () => {
  expect(getApiRoute([
    '/a',
    '/a/b',
    '/a/c',
    '/a/b/c',
  ], '/a/b/index.ts', 'create')).toEqual('/create')
})

test('transformClientApi', () => {
  const code = `
  import path from 'node:path'

  export const a = defineApi({
    setup: function(data) {
      return path.join('/test', 'test')
    },
    schema: z.number(),
    test: 123,
  })

  export const b = defineApi(function(data) {
    return data
  }, { schema: z.number(), test: 123 })
  `

  const transform = transformClientApi(code, '/a/user.ts', ['/a'], { clientHandler: { name: 'apiPost' } })
  expect(transform.code).toEqual(`export const a = defineApi({
  setup: data => apiPost("/user/a", data),
  schema: z.number()
});
export const b = defineApi(data => apiPost("/user/b", data), {
  schema: z.number()
});`)
})

test('getLayerDirs', () => {
  const nuxt = {
    options: {
      _layers: [
        {
          config: {
            rootDir: '/test/',
          },
        },
        {
          config: {
            rootDir: 'C:\\test\\',
          },
        },
      ],
    },
  } as Nuxt

  expect(getLayerDirs(nuxt, 'api')).toEqual([
    '/test/api',
    'C:/test/api',
  ])
})
