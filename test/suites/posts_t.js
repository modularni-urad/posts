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
      const all = await r.get(`/`)
      p.id = all.body[0].id
    })

    it('shall update the item pok1', async () => {
      const change = {
        title: 'pok1changed'
      }
      const res = await r.put(`/${p.id}`)
        .send(change).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.text)
    })

    it('shall get all items', async () => {
      const res = await r.get(`/`)
      res.body.length.should.eql(1)
      res.body[0].title.should.eql('pok1changed')
      res.should.have.status(200)
    })
  })
}
