import type { ZodType, z } from 'zod'
import { EventHandler } from 'h3'


export interface DefineApiOptions<Props extends ZodType<any, any, any>, HandlerReturn> {
  props: Props
  middlewares?: EventHandler[],
  handler: (data: z.infer<Props>) => HandlerReturn
}

export interface DefineApiOptions2<HandlerReturn> {
  middlewares?: EventHandler[],
  handler: (data?: any) => HandlerReturn
}

export function defineApi<Props extends ZodType<any, any, any>, HandlerReturn>(options: DefineApiOptions<Props, HandlerReturn>): DefineApiOptions<Props, HandlerReturn>['handler'] & Omit<DefineApiOptions<Props, HandlerReturn>, 'handler'>
export function defineApi<HandlerReturn>(options: DefineApiOptions2<HandlerReturn>): DefineApiOptions2<HandlerReturn>['handler'] & Omit<DefineApiOptions2<HandlerReturn>, 'handler'>
export function defineApi<HandlerReturn>(handler: DefineApiOptions2<HandlerReturn>['handler']): DefineApiOptions2<HandlerReturn>['handler']

export function defineApi<Props extends ZodType<any, any, any>, HandlerReturn>(
  handler: DefineApiOptions<Props, HandlerReturn>['handler'],
  options: Omit<DefineApiOptions<Props, HandlerReturn>, 'handler'>
): DefineApiOptions<Props, HandlerReturn>['handler'] & Omit<DefineApiOptions<Props, HandlerReturn>, 'handler'>

export function defineApi<HandlerReturn>(
  handler: DefineApiOptions2<HandlerReturn>['handler'],
  options: Omit<DefineApiOptions2<HandlerReturn>, 'handler'>
): DefineApiOptions2<HandlerReturn>['handler'] & Omit<DefineApiOptions2<HandlerReturn>, 'handler'>

export function defineApi<T extends { handler: any }>(optionsOrHandle: T | T['handler'], options?: T) {
  const o: any = {
    ...options,
    ...(typeof optionsOrHandle === 'function' ? { handler: optionsOrHandle } : optionsOrHandle),
  }

  Object.keys(o).forEach((key) => {
    if (key !== 'handler') {
      o.handler[key] = o[key]
    }
  })

  return o.handler
}
