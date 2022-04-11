import _ from 'underscore'

module.exports = (g) => {
  const r = g.chai.request(g.baseurl)
  const expect = q.chai.expect

  return describe('feeds', () => {
    //
    it('shall get all items', async () => {
      const res = await r.get(`/feed/all.rss`).buffer(true)
      res.should.have.status(200)
      const contains = res.text.indexOf('rss version="2.0"') >= 0
      expect(contains, `rss feed not in response: ${res.text}`).to.be.true
    })
  })
}
