const test = require('tape')
const staticRoute = require('../index')
const sinon = require('sinon')
const path = require('path')

// this is packages where staticRoute makes "side effect"
// we need to inspect the output & side effect
// so we need to "stub" them
const http = require('http')
const fs = require('fs-extra')

test('Test serve from route', async t => {
  const state = {
    listenIsCalled: 0,
    resEndIsCalled: 0
  }

  // fake createServer
  sinon.stub(http, 'createServer').callsFake(requestListener => {
    // fake req
    const fakeRequest = {
      url: '/somepath/todir'
    }
    // fake res
    const fakeResponse = {
      end: body => {
        state.resEndIsCalled += 1
        t.equal(body, 'okay', 'output body is correct')
      }
    }

    requestListener(fakeRequest, fakeResponse)

    return {
      // fake listen
      listen: port => {
        state.listenIsCalled += 1
        t.equal(port, 4000, 'correct port')
      }
    }
  })

  // staticRoute implementation
  staticRoute('serve', router => {
    router('/somepath/todir', ctx => ctx.send('okay'))
  }, {
    port: 4000
  })

  // checking limitation
  t.equal(state.resEndIsCalled, 1, 'res.end is called "only" once')
  t.equal(state.listenIsCalled, 1, 'listen called "only" once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})

test('Test serve from static files', async t => {
  const state = {
    listenIsCalled: 0,
    resEndIsCalled: 0
  }

  const staticDir = path.resolve(__dirname, 'whatever/dir/path')

  // fake createServer
  sinon.stub(http, 'createServer').callsFake(requestListener => {
    // fake req
    const fakeRequest = {
      url: '/somepath/tofile.txt'
    }
    // fake res
    const fakeResponse = {
      end: (buffer, encoding) => {
        state.resEndIsCalled += 1
        t.equal(buffer.toString(encoding), 'okay', 'output body is correct')
      }
    }

    requestListener(fakeRequest, fakeResponse)

    return {
      // fake listen
      listen: port => {
        state.listenIsCalled += 1
        t.equal(port, 4000, 'correct port')
      }
    }
  })

  // fake (fs-extra).existsSync
  sinon.stub(fs, 'existsSync').callsFake(filepath => {
    t.equal(filepath, path.resolve(staticDir, 'somepath/tofile.txt'), 'search correct file')
    return true
  })

  // fake (fs-extra).readFileSync
  sinon.stub(fs, 'readFileSync').callsFake(filepath => {
    t.equal(filepath, path.resolve(staticDir, 'somepath/tofile.txt'), 'read correct file')
    return Buffer.from('okay', 'utf8')
  })

  // staticRoute implementation
  staticRoute('serve', router => {
  }, {
    port: 4000,
    static: [staticDir]
  })

  // checking limitation
  t.equal(state.resEndIsCalled, 1, 'res.end is called "only" once')
  t.equal(state.listenIsCalled, 1, 'listen called "only" once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})

test('Test serve not found', async t => {
  const state = {
    listenIsCalled: 0,
    resEndIsCalled: 0
  }

  // fake createServer
  sinon.stub(http, 'createServer').callsFake(requestListener => {
    // fake req
    const fakeRequest = {
      url: '/somepath/to/not/exist'
    }
    // fake res
    const fakeResponse = {
      statusCode: null,
      end: body => {
        state.resEndIsCalled += 1
        t.equal(fakeResponse.statusCode, 404, 'status code 404')
      }
    }

    requestListener(fakeRequest, fakeResponse)

    return {
      // fake listen
      listen: port => {
        state.listenIsCalled += 1
        t.equal(port, 4000, 'correct port')
      }
    }
  })

  // staticRoute implementation
  staticRoute('serve', router => {
  }, {
    port: 4000
  })

  // checking limitation
  t.equal(state.resEndIsCalled, 1, 'res.end is called "only" once')
  t.equal(state.listenIsCalled, 1, 'listen called "only" once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})
