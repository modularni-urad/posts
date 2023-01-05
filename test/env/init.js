import express from 'express'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import { attachPaginate } from 'knex-paginate'
const SessionServiceMock = require('modularni-urad-utils/test/mocks/sessionService')

process.env.DATABASE_URL = ':memory:'
process.env.NODE_ENV = 'test'
process.env.SESSION_SERVICE_PORT = 24000
process.env.SESSION_SERVICE = `http://localhost:${process.env.SESSION_SERVICE_PORT}`

module.exports = function (g) {
  const port = process.env.PORT || 3333
  Object.assign(g, {
    port,
    baseurl: `http://localhost:${port}`,
    mockUser: { id: 42 },
    sessionBasket: []
  })
  g.sessionSrvcMock = SessionServiceMock.default(process.env.SESSION_SERVICE_PORT, g)

  const dbinit = require('./dbinit').default

  g.InitApp = async function (ApiModule) {
    const auth = require('modularni-urad-utils/auth').default
    const knex = await dbinit()
    attachPaginate()
    await ApiModule.migrate(knex)

    const app = express()
    const appContext = { 
      express, knex, auth, 
      bodyParser: express.json()
    }
    const mwarez = ApiModule.init(appContext)
    app.use(mwarez)

    initErrorHandlers(app, (err) => {
      console.error(err)
    })

    return new Promise((resolve, reject) => {
      g.server = app.listen(g.port, '127.0.0.1', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  g.close = async function() {
    g.server.close()
    g.sessionSrvcMock.close()
  }
}