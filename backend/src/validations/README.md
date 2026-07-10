# Validations

Zod schemas for request validation — **one file per module**, consumed by the
`validate` middleware.

Convention:

```js
'use strict';
const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    price: z.coerce.number().nonnegative(),
  }),
});

module.exports = { createProductSchema };
```

Wire it up in the route: `router.post('/', validate(createProductSchema), controller.create)`.

No schemas exist yet — business modules are out of scope for this foundation.
