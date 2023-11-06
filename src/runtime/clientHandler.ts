import { useRequestHeaders } from '#imports'

export function clientHandler(api: string, body: any) {
  if (typeof body === 'string') {
    body = JSON.stringify(body)
  }

  return $fetch(api, {
    method: 'POST',
    body: body,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
  })
}
