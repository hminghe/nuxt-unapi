import { useRequestHeaders } from '#imports'

export function clientHandler(api: string, body: any) {

  return $fetch(api, {
    method: 'POST',
    body: JSON.stringify(body || {}),
    headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
  })
}
