import { z } from "zod"

export const test = defineApi({
  async handle () {
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
  props: z.object({
    number: z.number(),
    string: z.string(),
    optional: z.string().optional(),
  }),
  handle (data) {
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
  props: z.string(),

  handle (data) {
    return data + ' test'
  }
})


export const uploadFile = defineApi({
  async handle () {
    const event = useEvent()
    const multipart = await readMultipartFormData(event)

    delete multipart[0].data
    return multipart[0]
  }
})