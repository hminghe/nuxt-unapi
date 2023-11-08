/**
 * custom zod type
 */
import { MultiPartData } from 'h3'
import { z } from 'zod'

type ZodFile = MultiPartData | File

export const zodFile = () => z.custom<ZodFile>((val) => {
  // @ts-ignore
  return val && val.name && val.filename && val.data && val.type
})
