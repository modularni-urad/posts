import MWare from './middleware'

export default function (ctx) {
  const { auth, express } = ctx
  const bodyParser = express.json()
  const MW = MWare(ctx)
  const app = express()

  app.get('/', (req, res, next) => {
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : {}
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

  app.post('/', auth.session, auth.required, bodyParser, (req, res, next) => {
    MW.create(req.body, req.user, req.tenantid).then(result => {
      res.status(201).json(result)
    }).catch(next)
  })

  app.put('/:id', auth.session, auth.required, bodyParser, (req, res, next) => {
    MW.update(req.params.id, req.body, req.user, req.tenantid).then(result => {
      res.json(result)
    }).catch(next)
  })

  return app
}