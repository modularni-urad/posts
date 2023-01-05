import chai from 'chai'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
chai.should()

const g = { chai }
require('./env/init')(g)

describe('app', () => {
  before(() => {
    const InitModule = require('../index').default
    return g.InitApp(InitModule)
  })
  after(g.close)

  return describe('posts API', async () => {
    const submodules = [
      './suites/posts_t',
      './suites/import_t',
      './suites/feeds_t'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
