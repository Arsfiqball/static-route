const test = require('tape')
const staticRoute = require('../index')
const sinon = require('sinon')
const path = require('path')

// this is packages where staticRoute makes "side effect"
// we need to inspect the output & side effect
// so we need to "stub" them
const fs = require('fs-extra')
const logger = require('../logger')

// fs.emptyDirSync
// fs.writeFile
// fs.ensureDir
// fs.copy
// logger.info

test('Test compile from route with "no extension"', async t => {
  const state = {
    emptyDirSyncIsCalled: 0,
    loggerInfoIsCalled: 0,
    writeFileSyncIsCalled: 0,
    ensureDirSyncIsCalled: 0
  }

  const outputPath = path.resolve(__dirname, 'not/actual/output')

  sinon.stub(fs, 'emptyDirSync').callsFake(rootPath => {
    t.equal(rootPath, outputPath, 'clean correct folder')
    state.emptyDirSyncIsCalled += 1
  })

  sinon.stub(logger, 'info').callsFake(() => {
    state.loggerInfoIsCalled += 1
  })

  sinon.stub(fs, 'writeFileSync').callsFake((outputName, body, encoding) => {
    t.equal(outputName, path.resolve(outputPath, 'somepath/todir/index.html'), 'write to correct file')
    t.equal((Buffer.from(body, encoding)).toString(), 'okay', 'write correct file content')
    state.writeFileSyncIsCalled += 1
    return Promise.resolve()
  })

  sinon.stub(fs, 'ensureDirSync').callsFake(outputDir => {
    t.equal(outputDir, path.resolve(outputPath, 'somepath/todir'), 'ensure correct directory')
    state.ensureDirSyncIsCalled += 1
    return Promise.resolve()
  })

  // staticRoute implementation
  staticRoute('compile', router => {
    router('/somepath/todir', ctx => ctx.send('okay'))
  }, {
    output: outputPath
  })

  t.equal(state.emptyDirSyncIsCalled, 1, 'emptyDirSync is called only once')
  t.equal(state.loggerInfoIsCalled, 2, 'logger.info is called only twice')
  t.equal(state.writeFileSyncIsCalled, 1, 'writeFileSync is called only once')
  t.equal(state.ensureDirSyncIsCalled, 1, 'ensureDirSync is called only once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})

test('Test compile from route with "extension"', async t => {
  const state = {
    emptyDirSyncIsCalled: 0,
    loggerInfoIsCalled: 0,
    writeFileSyncIsCalled: 0,
    ensureDirSyncIsCalled: 0
  }

  const outputPath = path.resolve(__dirname, 'not/actual/output')

  sinon.stub(fs, 'emptyDirSync').callsFake(rootPath => {
    t.equal(rootPath, outputPath, 'clean correct folder')
    state.emptyDirSyncIsCalled += 1
  })

  sinon.stub(logger, 'info').callsFake(() => {
    state.loggerInfoIsCalled += 1
  })

  sinon.stub(fs, 'writeFileSync').callsFake((outputName, body, encoding) => {
    t.equal(outputName, path.resolve(outputPath, 'somepath/tofile.txt'), 'write to correct file')
    t.equal((Buffer.from(body, encoding)).toString(), 'okay', 'write correct file content')
    state.writeFileSyncIsCalled += 1
    return Promise.resolve()
  })

  sinon.stub(fs, 'ensureDirSync').callsFake(outputDir => {
    t.equal(outputDir, path.resolve(outputPath, 'somepath'), 'ensure correct directory')
    state.ensureDirSyncIsCalled += 1
    return Promise.resolve()
  })

  // staticRoute implementation
  staticRoute('compile', router => {
    router('/somepath/tofile.txt', ctx => ctx.send('okay'))
  }, {
    output: outputPath
  })

  t.equal(state.emptyDirSyncIsCalled, 1, 'emptyDirSync is called only once')
  t.equal(state.loggerInfoIsCalled, 2, 'logger.info is called only twice')
  t.equal(state.writeFileSyncIsCalled, 1, 'writeFileSync is called only once')
  t.equal(state.ensureDirSyncIsCalled, 1, 'ensureDirSync is called only once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})

test('Test compile from static files', async t => {
  const state = {
    emptyDirSyncIsCalled: 0,
    loggerInfoIsCalled: 0,
    copySyncIsCalled: 0
  }

  const staticDir = path.resolve(__dirname, 'whatever/dir/path')
  const outputPath = path.resolve(__dirname, 'not/actual/output')

  sinon.stub(fs, 'emptyDirSync').callsFake(rootPath => {
    t.equal(rootPath, outputPath, 'clean correct folder')
    state.emptyDirSyncIsCalled += 1
  })

  sinon.stub(logger, 'info').callsFake(() => {
    state.loggerInfoIsCalled += 1
  })

  sinon.stub(fs, 'copySync').callsFake((staticPath, rootPath) => {
    t.equal(staticPath, staticDir, 'copy correct source')
    t.equal(rootPath, outputPath, 'paste to correct destination')
    state.copySyncIsCalled += 1
  })

  // staticRoute implementation
  staticRoute('compile', router => {
  }, {
    output: outputPath,
    static: [staticDir]
  })

  t.equal(state.emptyDirSyncIsCalled, 1, 'emptyDirSync is called only once')
  t.equal(state.loggerInfoIsCalled, 2, 'logger.info is called only twice')
  t.equal(state.copySyncIsCalled, 1, 'copySync is called only once')

  // restore "stubed" packages
  sinon.restore()

  // end test to start next test
  t.end()
})
