[![Build Status](https://travis-ci.org/Arsfiqball/static-route.svg?branch=master)](https://travis-ci.org/Arsfiqball/static-route)

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
  * ``port`` integer, for server (default: ``3000``)
  * ``output`` path string, to compile (default: ``process.cwd() + /dist``)
  * ``static`` array of path string (directory), served as static files
  * ``clean`` boolean, clean old output before compiling

Example:
```js
const staticRoute = require('arsf-static-route')

staticRoute('serve', router => {
  router('/', ctx => ctx.send('Hello World'))
  router('/about', ctx => ctx.send('This is about page'))
})
```
