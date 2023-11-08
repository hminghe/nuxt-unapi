/**
 * custom zod type
 */
import { MultiPartData } from 'h3'
import { z } from 'zod'

export type ZodFile = MultiPartData

export const zodFile = () => z.custom<ZodFile>((val) => {
  // @ts-ignore
  return val && val.name && val.filename && val.data && val.type
})
