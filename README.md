<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: nuxt-unapi
- Package name: nuxt-unapi
- Description: Full-stack API for Nxut 3
-->

# nuxt-unapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Full-stack API for Nxut 3.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-unapi?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->


## Install

1. Add `nuxt-unapi` dependency to your project

```bash
# Using pnpm
pnpm add -D nuxt-unapi

# Using yarn
yarn add --dev nuxt-unapi

# Using npm
npm install --save-dev nuxt-unapi
```

2. Add `nuxt-unapi` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-unapi'
  ],

  // Required enable asyncContext
  experimental: {
    asyncContext: true,
  },
})
```

✨✨✨

## Usage

Expose server functions under `api/**.ts`
```typescript
// api/user.ts
import { z } from 'zod'

export const getUser = defineApi({
  props: z.number(),
  // id type is number
  handler (id) {
    return db.user.get(id)
  },
})

export const updateUser = defineApi({
  props: z.object({
    id: z.number(),
    name: z.string(),
    age: z.number().optional()
  }),
  
  // props are secure data validated by Zod.
  handler (props) {
    return db.user.update(props)  
  }
})
```

On the client side:
```typescript
import { getUser, updateUser } from '~/api/user.ts'

const user = await getUser(1)

user.name = 'nuxt-unapi'

const result = await updateUser(user)
```

Client validate. [Zod Docs](https://zod.dev/)
```typescript
updateUser.props.parse(user)
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-unapi/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-unapi

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-unapi.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-unapi

[license-src]: https://img.shields.io/npm/l/nuxt-unapi.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-unapi

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
