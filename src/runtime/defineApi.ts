import type { ZodType, z } from 'zod'
import { EventHandler } from 'h3'


export interface DefineApiOptions<Schema extends ZodType<any, any, any>, SetupReturn> {
  schema: Schema
  middlewares?: EventHandler[],
  setup: (data: z.infer<Schema>) => SetupReturn
}

export interface DefineApiOptions2<SetupReturn> {
  middlewares?: EventHandler[],
  setup: (data?: any) => SetupReturn
}

export function defineApi<Schema extends ZodType<any, any, any>, SetupReturn>(options: DefineApiOptions<Schema, SetupReturn>): DefineApiOptions<Schema, SetupReturn>['setup'] & Omit<DefineApiOptions<Schema, SetupReturn>, 'setup'>
export function defineApi<SetupReturn>(options: DefineApiOptions2<SetupReturn>): DefineApiOptions2<SetupReturn>['setup'] & Omit<DefineApiOptions2<SetupReturn>, 'setup'>
export function defineApi<SetupReturn>(setup: DefineApiOptions2<SetupReturn>['setup']): DefineApiOptions2<SetupReturn>['setup']

export function defineApi<Schema extends ZodType<any, any, any>, SetupReturn>(
  setup: DefineApiOptions<Schema, SetupReturn>['setup'],
  options: Omit<DefineApiOptions<Schema, SetupReturn>, 'setup'>
): DefineApiOptions<Schema, SetupReturn>['setup'] & Omit<DefineApiOptions<Schema, SetupReturn>, 'setup'>

export function defineApi<SetupReturn>(
  setup: DefineApiOptions2<SetupReturn>['setup'],
  options: Omit<DefineApiOptions2<SetupReturn>, 'setup'>
): DefineApiOptions2<SetupReturn>['setup'] & Omit<DefineApiOptions2<SetupReturn>, 'setup'>

export function defineApi<T extends { setup: any }>(optionsOrSetup: T | T['setup'], options?: T) {
  const o: any = {
    ...options,
    ...(typeof optionsOrSetup === 'function' ? { setup: optionsOrSetup } : optionsOrSetup),
  }

  Object.keys(o).forEach((key) => {
    if (key !== 'setup') {
      o.setup[key] = o[key]
    }
  })

  return o.setup
}
