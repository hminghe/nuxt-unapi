import { defineEventHandler, readBody, readMultipartFormData, getHeaders } from 'h3'
import type { H3Event, EventHandlerRequest } from 'h3'
import { createError } from '#imports'

import type { ZodType } from 'zod'
import type { DefineApiOptions } from './defineApi'
import { isPromise } from 'node:util/types'

async function getBody (event: H3Event<EventHandlerRequest>) {
  const contentType = getHeaders(event)['content-type']?.split(';', 1)[0]

  if (contentType === 'multipart/form-data') {
    const body: Record<string, any> = {}

    const formData = await readMultipartFormData(event)
    if (formData) {  
      formData.forEach(row => {
        console.log('row.name', row.name)
        if (row.name) {
          const value = row.filename ? row : row.data.toString()

          if (body[row.name]) {
            if (!Array.isArray(body[row.name])) {
              body[row.name] = [
                body[row.name],
                value,
              ]
            } else {
              body[row.name].push(value)
            }
          } else {
            body[row.name] = value
          }
        }
      })
    }

    console.log('body', body)
    
    return body
  } else {
    return readBody(event)
  }
}


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
      const body = await getBody(event)
      
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
