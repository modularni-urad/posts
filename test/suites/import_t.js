import _ from 'underscore'

module.exports = (g) => {
  const r = g.chai.request(g.baseurl)

  const data = {
    uuid: 'dksjfowjfowjf',
    title: 'post druhy',
    perex: 'popis druhy',
    tags: 'doprava',
    author: 'gandalf',
    content: 'content of druhy',
    published: new Date().toISOString(),
    created: new Date().toISOString(),
    status: 'published'
  }

  return describe('import', () => {
    //
    // it('must not create a new item without auth', async () => {
    //   const res = await r.post(`/`).send(p)
    //   res.should.have.status(401)
    // })

    it('shall import data', async () => {
      const res = await r.post(`/import`).send(data).set('Authorization', 'Bearer f')
      res.should.have.status(200, res.text)
      const all = await r.get(`/`)
      all.body.length.should.eql(2)
    })
  })
}
