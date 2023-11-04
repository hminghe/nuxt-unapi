<script setup lang="ts">
import { test, testParamsObject, testParamsString } from './api/test'

const { data } = useAsyncData(() => test())

const { data: a } = useFetch('/api/test')


const objectResult = ref()
async function postObject () {
  objectResult.value = await testParamsObject({ string: '123', number: 123, optional: '222' })
}
const xerror = useError()
const errorResult = ref()
async function postErrorType () {
  try {
    await testParamsObject({ string: '123', number: "123" })
  } catch (error) {
    console.log(error)

    console.log('error', xerror.value)

    errorResult.value = error.data.data
  }

}


const stringResult = ref()
async function postString () {
  stringResult.value = await testParamsString("123")
}

</script>

<template>
  <div>
    ssr data: {{ data }}
    {{ a }}
    <div>
      <button @click="postObject">postObject</button>
      result: {{ objectResult }}
    </div>

    <div>
      <button @click="postErrorType">postError</button>
      error: {{ errorResult }}
    </div>

    <div>
      <button @click="postString">postString</button>
      result: {{ stringResult }}
    </div>
  </div>
</template>
