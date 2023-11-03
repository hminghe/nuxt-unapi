import { z } from "zod"

export const test = defineApi({
  async setup () {
    return 'unapi test'
  }
})

export const testParamsObject = defineApi({
  schema: z.object({
    number: z.number(),
    string: z.string(),
    optional: z.string().optional(),
  }),
  setup (data) {
    return data
  }
})

export const testParamsString = defineApi({
  schema: z.string(),

  setup (data) {
    return data + ' test'
  }
})
