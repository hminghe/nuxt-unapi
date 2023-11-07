<script setup lang="ts">
import { uploadFileTest, test, testParamsObject, testParamsString, uploadMultipleFileTest } from './api/test'

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

const uploadFileResult = ref('')
async function onUploadFile (event: Event & { target: HTMLInputElement }) {
  console.log('event', event)
  if (event.target.files) {
    const file = event.target.files[0]
    console.log('file', file)
    const fd = uploadFileTest.sfd()
    fd.append('test', 123)
    fd.append('test1', 'test')
    fd.append('file', file)
    
    uploadFileResult.value = await uploadFileTest(fd)

  }
}

const uploadFileResult2 = ref('')
async function onUploadFile2 (event: Event & { target: HTMLInputElement }) {
  console.log('event', event)
  if (event.target.files) {

    
    const fd = uploadMultipleFileTest.sfd()
    fd.append('test', 123)
    fd.append('test1', 'test')
    for (const file of event.target.files) {
      fd.append('files', file)
    }
    
    uploadFileResult2.value = await uploadMultipleFileTest(fd)

  }
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

    <div>
      <input type="file" @change="onUploadFile" />
      result: {{ uploadFileResult }}
    </div>

    <div>
      <input type="file" multiple @change="onUploadFile2" />
      multiple result: {{ uploadFileResult2 }}
    </div>
  </div>
</template>
