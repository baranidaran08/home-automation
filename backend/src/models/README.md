# Models

Mongoose schemas & models live here — **one file per collection**, e.g.
`user.model.js`, `category.model.js`, `product.model.js`, `template.model.js`,
`quotation.model.js`.

Convention:

```js
'use strict';
const { Schema, model } = require('mongoose');

const productSchema = new Schema({ /* fields */ }, { timestamps: true });

module.exports = model('Product', productSchema);
```

No models are defined yet — business modules are intentionally out of scope for
this foundation.
