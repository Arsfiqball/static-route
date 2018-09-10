const http = require('http')
const url = require('url')
const fs = require('fs-extra')
const path = require('path')

function serve (cb, opts) {
  opts = typeof opts === 'object' ? opts : {}
  opts.port = opts.port || 3000

  const server = http.createServer((req, res) => {
    const parsedURL = url.parse(req.url)

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
  const router = (pathname, controller) => {
    const outputDir = opts && opts.output
      ? path.resolve(opts.output + pathname)
      : path.resolve(process.cwd(), 'dist' + pathname)

    const ctx = {
      send: body => {
        fs.writeFile(outputDir + '/index.html', body, 'utf8')
          .then(() => console.log('Published ' + pathname))
      }
    }

    fs.ensureDir(outputDir)
      .then(() => controller(ctx))
  }

  cb(router)
}

module.exports = function (mode, cb, opts) {
  if (mode === 'compile') return compile(cb, opts)
  if (mode === 'serve') return serve(cb, opts)
}
