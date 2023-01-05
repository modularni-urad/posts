import MWare from './middleware'
import { createSchemaFn, updateSchemaFn } from './schema'
import { createValidationMiddleware } from '@modularni-urad/utils/entity'
import { GROUPS } from '../consts'

export default function (ctx) {
  const { auth, express, bodyParser } = ctx
  const MW = MWare(ctx)
  const app = express()
  const validateOnCreate = createValidationMiddleware(createSchemaFn)
  const validateOnUpdate = createValidationMiddleware(updateSchemaFn)

  app.get('/', (req, res, next) => {
    MW.list(req.query, req.tenantid).then(result => {
      res.json(result)
    }).catch(next)
  })

  app.get('/feed/(:tag).(:type)', (req, res, next) => {
    MW.feed(req.params.tag, req.tenantid).then(result => {
      res.set('content-type', 'application/rss+xml')
      res.send(result)
    }).catch(next)
  })

  app.post('/', 
  auth.session, auth.required, bodyParser, validateOnCreate, 
  (req, res, next) => {
    MW.create(req.body, req.user, req.tenantid).then(result => {
      res.status(201).json(result)
    }).catch(next)
  })

  app.post('/import', 
  auth.session, auth.requireMembership(GROUPS.IMPORTERS), bodyParser,
  (req, res, next) => {
    MW.doimport(req.body, req.tenantid).then(result => res.json(result)).catch(next)
  })

  app.put('/:id', 
  auth.session, auth.required, bodyParser, validateOnUpdate,
  (req, res, next) => {
    MW.update(Number(req.params.id), req.body, req.user, req.tenantid).then(result => {
      res.json(result)
    }).catch(next)
  })

  app.put('/:id/status/:status', 
  auth.session, auth.required, (req, res, next) => {
    MW.setStatus(Number(req.params.id), req.params.status, req.user, req.tenantid)
    .then(result => {
      res.json(result)
    }).catch(next)
  })

  return app
}