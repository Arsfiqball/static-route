# Installation
```bash
yarn add arsf-static-route
```

# Usage
``staticRoute(mode, callback, options)``
* mode: between ``compile`` to compile pages or ``serve`` to serve pages dynamically.
* callback: a ``function(ctx)``. Context will be passed to manipulate the output pages.
  * ``ctx.send(body)`` is the final data which will be sent.
* options: staticRoute options
  * ``port`` for server
  * ``output`` path to compile

Example:
```js
const staticRoute = require('arsf-static-route')

staticRoute('serve', router => {
  router('/', ctx => ctx.send('Hello World'))
  router('/about', ctx => ctx.send('This is about page'))
})
```
