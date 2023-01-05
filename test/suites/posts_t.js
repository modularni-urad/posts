import _ from 'underscore'

module.exports = (g) => {
  const r = g.chai.request(g.baseurl)

  const p = {
    title: 'post první',
    perex: 'popis proj1',
    tags: 'zivpros',
    content: 'content of post1',
    published: new Date().toISOString()
  }

  return describe('posts', () => {
    //
    it('must not create a new item without auth', async () => {
      const res = await r.post(`/`).send(p)
      res.should.have.status(401)
    })

    it('must not create a new item without mandatory item', async () => {
      const res = await r.post(`/`).send(_.omit(p, 'perex'))
        .set('Authorization', 'Bearer f')
      res.should.have.status(400)
    })

    it('shall create a new item pok1', async () => {
      const res = await r.post(`/`).send(p).set('Authorization', 'Bearer f')
      res.should.have.status(201, res.text)
      res.should.have.header('content-type', /^application\/json/)
      p.id = res.body.id
    })

    it('shall update the item pok1', async () => {
      const change = {
        title: 'change1'
      }
      const res = await r.put(`/${p.id}`).send(change).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.text)
    })

    it('must not update the item pok1', async () => {
      g.mockUser.id = 10
      const change = {
        title: 'change2'
      }
      const res = await r.put(`/${p.id}`).send(change).set('Authorization', 'Bearer f')
      res.should.have.status(403, res.status)
    })

    it('shall update the item pok1', async () => {
      g.mockUser.groups = ['post_publishers']
      const change = {
        title: 'change3'
      }
      const res = await r.put(`/${p.id}`).send(change).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.status)
    })

    it('shall get all items', async () => {
      g.mockUser.id = 42
      g.mockUser.groups = []
      const res = await r.get(`/`)
      res.body.length.should.eql(1)
      res.body[0].title.should.eql('change3', res.body[0].title)
      res.should.have.status(200, res.status)
    })

    it('must not set status published, iam not publisher', async () => {
      const res = await r.put(`/${p.id}/status/published`).set('Authorization', 'Bearer f')
      res.should.have.status(403, res.status)
    })

    it('must not set unknown sataus', async () => {
      const res = await r.put(`/${p.id}/status/unknown`).set('Authorization', 'Bearer f')
      res.should.have.status(400, res.status)
    })

    it('shall set status to review', async () => {
      const res = await r.put(`/${p.id}/status/review`).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.status)
    })

    it('shall set status to published', async () => {
      g.mockUser.groups = ['post_publishers']
      const res = await r.put(`/${p.id}/status/published`).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.status)
      g.mockUser.groups = []
    })
  })
}
