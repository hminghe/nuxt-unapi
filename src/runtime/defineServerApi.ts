import { defineEventHandler, readBody } from 'h3'
// import type { EventHandler } from 'h3'
import { createError } from '#imports'

import type { ZodType } from 'zod'
import type { DefineApiOptions } from './defineApi'


// let currentInterceptors: EventHandler[] = []

// export function addApiInterceptor(interceptorHandler: EventHandler) {
//   if (!currentInterceptors) {
//     currentInterceptors = []
//   }
//   currentInterceptors.push(interceptorHandler)
// }

// export function clearApiInterceptor() {
//   currentInterceptors = []
// }

export function defineServerApi<
  SetupReturn, Schema extends ZodType<any, any, any>, T extends DefineApiOptions<Schema, SetupReturn>['setup'] & Omit<DefineApiOptions<Schema, SetupReturn>, 'setup'>,
>(setup: T, eventHandler = defineEventHandler) {
  // clearApiInterceptor()

  // if (setup.interceptor) {
  //   setup.interceptor()
  // }

  return eventHandler(async (event) => {
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
