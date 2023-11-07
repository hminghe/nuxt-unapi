import { z } from "zod"
import { defineFormDataApi, zFile } from "../../src/runtime/defineFormDataApi"

export const test = defineApi({
  async handler () {
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
  handler (data) {
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

  handler (data) {
    return data + ' test'
  }
})


export const uploadFileTest = defineFormDataApi({
  props: z.object({
    test: z.coerce.number(),
    test1: z.string(),
    file: zFile(),
  }),

  handler (props) {
    console.log('props', props)

    return `File size: ${props.file.data?.length}`
  }
})

export const uploadMultipleFileTest = defineFormDataApi({
  props: z.object({
    test: z.coerce.number(),
    test1: z.string(),
    files: zFile().array(),
  }),

  handler (props) {
    console.log('props', props)

    return `File: ${props.files.map(v => v.filename + ': ' + v.data?.length).join('----')}`
  }
})
