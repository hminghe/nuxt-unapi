import type { ZodType, z } from 'zod'
import { EventHandler } from 'h3'


export interface DefineApiOptions<Props extends ZodType<any, any, any>, HandleReturn> {
  props: Props
  middlewares?: EventHandler[],
  handle: (data: z.infer<Props>) => HandleReturn
}

export interface DefineApiOptions2<HandleReturn> {
  middlewares?: EventHandler[],
  handle: (data?: any) => HandleReturn
}

export function defineApi<Props extends ZodType<any, any, any>, HandleReturn>(options: DefineApiOptions<Props, HandleReturn>): DefineApiOptions<Props, HandleReturn>['handle'] & Omit<DefineApiOptions<Props, HandleReturn>, 'handle'>
export function defineApi<HandleReturn>(options: DefineApiOptions2<HandleReturn>): DefineApiOptions2<HandleReturn>['handle'] & Omit<DefineApiOptions2<HandleReturn>, 'handle'>
export function defineApi<HandleReturn>(handle: DefineApiOptions2<HandleReturn>['handle']): DefineApiOptions2<HandleReturn>['handle']

export function defineApi<Props extends ZodType<any, any, any>, HandleReturn>(
  handle: DefineApiOptions<Props, HandleReturn>['handle'],
  options: Omit<DefineApiOptions<Props, HandleReturn>, 'handle'>
): DefineApiOptions<Props, HandleReturn>['handle'] & Omit<DefineApiOptions<Props, HandleReturn>, 'handle'>

export function defineApi<HandleReturn>(
  handle: DefineApiOptions2<HandleReturn>['handle'],
  options: Omit<DefineApiOptions2<HandleReturn>, 'handle'>
): DefineApiOptions2<HandleReturn>['handle'] & Omit<DefineApiOptions2<HandleReturn>, 'handle'>

export function defineApi<T extends { handle: any }>(optionsOrHandle: T | T['handle'], options?: T) {
  const o: any = {
    ...options,
    ...(typeof optionsOrHandle === 'function' ? { handle: optionsOrHandle } : optionsOrHandle),
  }

  Object.keys(o).forEach((key) => {
    if (key !== 'handle') {
      o.handle[key] = o[key]
    }
  })

  return o.handle
}
