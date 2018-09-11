const http = require('http')
const url = require('url')
const fs = require('fs-extra')
const path = require('path')
const logger = require('./logger')

function serve (cb, opts) {
  opts = typeof opts === 'object' ? opts : {}
  opts.port = opts.port || 3000
  opts.static = opts.static || []

  const server = http.createServer((req, res) => {
    let routeIsFound = false
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
          routeIsFound = true
        }
      }
    }

    if (routeIsFound) return

    const ctx = {
      send: body => {
        res.end(body, 'utf8')
      }
    }

    const router = (pathname, controller) => {
      if (pathname === parsedURL.pathname) {
        routeIsFound = true
        controller(ctx)
      }
    }

    cb(router)

    if (routeIsFound) return

    res.statusCode = 404
    res.end('Not found', 'utf8')
  })

  server.listen(opts.port, () => {
    logger.info('server is listening on port ' + opts.port)
  })
}

function compile (cb, opts) {
  opts = typeof opts === 'object' ? opts : {}
  opts.static = opts.static || []
  opts.clean = opts.clean || true

  const rootPath = opts && opts.output
    ? path.resolve(opts.output)
    : path.resolve(process.cwd(), 'dist')

  if (opts.clean) {
    fs.emptyDirSync(rootPath)
    logger.info('Clean ' + path.relative(process.cwd(), rootPath))
  }

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
        fs.writeFileSync(outputName, body, 'utf8')
        logger.info('Published /' + pathname)
      }
    }

    fs.ensureDirSync(outputDir)
    controller(ctx)
  }

  cb(router)

  for (staticPath of opts.static) {
    fs.copySync(staticPath, rootPath)
    logger.info('Published ' + path.relative(process.cwd(), staticPath) + '/{files} -> /{files}')
  }
}

module.exports = function (mode, cb, opts) {
  if (mode === 'compile') return compile(cb, opts)
  if (mode === 'serve') return serve(cb, opts)
}
