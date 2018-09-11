const http = require('http')
const url = require('url')
const fs = require('fs-extra')
const path = require('path')

function serve (cb, opts) {
  opts = typeof opts === 'object' ? opts : {}
  opts.port = opts.port || 3000
  opts.static = opts.static || []

  const server = http.createServer((req, res) => {
    const parsedURL = url.parse(req.url)

    if (path.extname(parsedURL.pathname)) {
      for (staticPath of opts.static) {
        const searchFilePath = path.resolve(
          staticPath,
          parsedURL
            .pathname
            .split('/')
            .filter(segment => segment)
            .join('/')
        )
        if (fs.existsSync(searchFilePath)) {
          const file = fs.readFileSync(searchFilePath)
          res.end(file, 'utf8')
        }
      }
    }

    const ctx = {
      send: body => {
        res.end(body, 'utf8')
      }
    }

    const router = (pathname, controller) => {
      if (pathname === parsedURL.pathname) controller(ctx)
    }

    cb(router)

    res.end('Not found', 'utf8')
  })

  server.listen(opts.port, () => {
    console.log('server is listening on port ' + opts.port)
  })
}

function compile (cb, opts) {
  opts = typeof opts === 'object' ? opts : {}
  opts.static = opts.static || []

  const rootPath = opts && opts.output
    ? path.resolve(opts.output)
    : path.resolve(process.cwd(), 'dist')

  const router = (pathname, controller) => {
    pathname = pathname.split('/').filter(segment => segment).join('/')

    const outputDir = !path.extname(pathname)
      ? path.resolve(rootPath, pathname)
      : path.resolve(rootPath, pathname.split('/').slice(0, -1).join('/'))

    const outputName = !path.extname(pathname)
      ? path.resolve(outputDir, 'index.html')
      : path.resolve(outputDir, path.basename(pathname))

    const ctx = {
      send: body => {
        fs.writeFile(outputName, body, 'utf8')
          .then(() => console.log('Published /' + pathname))
      }
    }

    fs.ensureDir(outputDir)
      .then(() => controller(ctx))
  }

  cb(router)

  for (staticPath of opts.static) {
    fs.copy(staticPath, rootPath)
      .then(() => console.log('Published ' + path.relative(process.cwd(), staticPath) + '/{files} -> /{files}'))
  }
}

module.exports = function (mode, cb, opts) {
  if (mode === 'compile') return compile(cb, opts)
  if (mode === 'serve') return serve(cb, opts)
}
