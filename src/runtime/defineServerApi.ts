import { defineEventHandler, readBody } from 'h3'
// import type { EventHandler } from 'h3'
import { createError } from '#imports'

import type { ZodType } from 'zod'
import type { DefineApiOptions } from './defineApi'
import { isPromise } from 'node:util/types'



export function defineServerApi<
  SetupReturn, Schema extends ZodType<any, any, any>, T extends DefineApiOptions<Schema, SetupReturn>['setup'] & Omit<DefineApiOptions<Schema, SetupReturn>, 'setup'>,
>(setup: T, eventHandler = defineEventHandler) {


  return eventHandler(async (event) => {
    if (setup.middlewares && setup.middlewares.length > 0) {
      for (const middleware of setup.middlewares) {
        let middlewareResult = middleware(event)
        if (isPromise(middlewareResult)) {
          middlewareResult = await middlewareResult
        }
        if (middlewareResult !== undefined) {
          return middlewareResult
        }
      }
    }

    const schema = setup.schema
    if (schema) {
      const body = await readBody(event)
      const res = schema.safeParse(body)
      
      if (!res.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Parameter Error',
          // @ts-ignore
          data: res.error.errors
        })
      }

      return setup(res.data)
    }

    // @ts-ignore
    return setup()
  })
}
