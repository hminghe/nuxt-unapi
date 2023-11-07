import { ZodType, z } from 'zod'
import { MultiPartData } from 'h3'
import { DefineApiOptions } from './defineApi'

type UnArray<T> = T extends (infer U)[] ? U : T;

// @ts-ignore
export interface SafeFormData<T> extends FormData {
  // @ts-ignore
  append<K extends keyof T>(name: K, value: UnArray<T[K]>, fileName?: string): void
  // @ts-ignore
  get<K extends keyof T>(name: K): void
}

interface _File extends Partial<MultiPartData> {}

export const zFile = () => z.custom<_File>((val) => {
  // @ts-expect-error
  return typeof val === 'object' && val.name && val.filename && val.data && val.type
})

export function defineFormDataApi<
  Props extends ZodType<any, any, any>,
  HandleReturn
>(options: DefineApiOptions<Props, HandleReturn>) {
  type Options = typeof options
  

  const safeFormData = () => new FormData() as SafeFormData<z.infer<Props>>
  type SafeFormDataType = typeof safeFormData
  

  const o: any = options
  o.sfd = o.safeFormData = safeFormData
  Object.keys(options).forEach((key) => {
    o.handle[key] = o[key]
  })

  type Handle = (props: ReturnType<SafeFormDataType>) => HandleReturn
  
  return o.handle as Handle & Options & {
    sfd: SafeFormDataType
    safeFormData: SafeFormDataType
    handle: Handle
  }
}

