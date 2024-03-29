import { ZodType, z } from 'zod'
import { DefineApiOptions } from './defineApi'
import { MultiPartData } from 'h3'

type UnArray<T> = T extends (infer U)[] ? U : T;

// @ts-ignore
export interface SafeFormData<T> extends FormData {
  // @ts-ignore
  append<K extends keyof T>(name: K, value: UnArray<T[K]>, fileName?: string): void
  // @ts-ignore
  get<K extends keyof T>(name: K): void
}

export type TransformClientType<T> = {
  [P in keyof T]?: T[P] extends MultiPartData ? File : T[P]
};


export function defineFormDataApi<
  Props extends ZodType<any, any, any>,
  HandlerReturn
>(options: DefineApiOptions<Props, HandlerReturn>) {
  type Options = typeof options


  const safeFormData = () => new FormData() as SafeFormData<TransformClientType<z.infer<Props>>>
  type SafeFormDataType = typeof safeFormData


  const o: any = options
  o.sfd = o.safeFormData = safeFormData
  Object.keys(options).forEach((key) => {
    o.handler[key] = o[key]
  })

  type Handler = (props: ReturnType<SafeFormDataType>) => Promise<HandlerReturn>

  return o.handler as Handler & Options & {
    sfd: SafeFormDataType
    safeFormData: SafeFormDataType
    handler: Handler
  }
}

