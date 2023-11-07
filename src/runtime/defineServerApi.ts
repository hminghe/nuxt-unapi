import { defineEventHandler, readBody } from 'h3'
import { createError } from '#imports'

import type { ZodType } from 'zod'
import type { DefineApiOptions } from './defineApi'
import { isPromise } from 'node:util/types'



export function defineServerApi<
  HandleReturn, Props extends ZodType<any, any, any>, T extends DefineApiOptions<Props, HandleReturn>['handle'] & Omit<DefineApiOptions<Props, HandleReturn>, 'handle'>,
>(handle: T, eventHandler = defineEventHandler) {


  return eventHandler(async (event) => {
    if (handle.middlewares && handle.middlewares.length > 0) {
      for (const middleware of handle.middlewares) {
        let middlewareResult = middleware(event)
        if (isPromise(middlewareResult)) {
          middlewareResult = await middlewareResult
        }
        if (middlewareResult !== undefined) {
          return middlewareResult
        }
      }
    }

    const props = handle.props
    if (props) {
      const body = await readBody(event)
      const res = props.safeParse(body)
      
      if (!res.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Parameter Error',
          // @ts-ignore
          data: res.error.errors
        })
      }

      return handle(res.data)
    }

    // @ts-ignore
    return handle()
  })
}
