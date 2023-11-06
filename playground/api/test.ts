import { z } from "zod"

export const test = defineApi({
  async setup () {
    const ctx = useEvent().context
    return 'unapi test ' + ctx.test1 + ' ' + ctx.test2
  },
  middlewares: [
    defineEventHandler((event) => {
      event.context.test1 = 'test1'
      console.log('middlewares test1')
    }),
    () => {
      useEvent().context.test2 = 'test2'
      console.log('middlewares test2')
    },
  ]
})

export const testParamsObject = defineApi({
  schema: z.object({
    number: z.number(),
    string: z.string(),
    optional: z.string().optional(),
  }),
  setup (data) {
    return data
  },
  middlewares: [
    defineEventHandler(() => {
      console.log('middlewares test/testParamsObject')
    }),
    // 中断
    () => {
      if (Math.random() < 0.5) {
        // return 'error'
        return createError({
          statusCode: 401,
          message: 'Unauthorized'
        })
      }
    }
  ]
})

export const testParamsString = defineApi({
  schema: z.string(),

  setup (data) {
    return data + ' test'
  }
})


export const uploadFile = defineApi({
  async setup () {
    const event = useEvent()
    const multipart = await readMultipartFormData(event)

    delete multipart[0].data
    return multipart[0]
  }
})
