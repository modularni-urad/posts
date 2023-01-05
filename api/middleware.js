// import axios from 'axios'
import { remove as removeDiacritics } from 'diacritics'
import slugify from 'slugify'
import _ from 'underscore'
import { TABLE_NAMES, GROUPS, getQB } from '../consts'
import { listItems } from 'modularni-urad-utils/entity'
import { NotAllowedError, NotFoundError } from 'modularni-urad-utils/errors'
import generateFeed from './feeds'
import moment from 'moment'

export default (ctx) => {
  const { knex } = ctx

  return { create, list, update, feed, doimport, setStatus }
  
  async function create (body, user, schema) {
    Object.assign(body, { 
      author: user.id.toString(),
      slug: body.title ? slugify(removeDiacritics(body.title)) : null
    })
    const i = await getQB(knex, TABLE_NAMES.POSTS, schema).insert(body).returning('*')
    return i[0]
  }

  function doimport (body, schema) {
    body = _.omit(body, 'id')
    body.slug = body.slug ? body.slug : slugify(removeDiacritics(body.title))
    return getQB(knex, TABLE_NAMES.POSTS, schema).insert(body).returning('*')
  }

  function amIPublisher (user) {
    return Boolean(user.groups && user.groups.find(i => i === GROUPS.PUBLISHERS))
  }

  async function get (id, schema) {
    const found = await getQB(knex, TABLE_NAMES.POSTS, schema).where({ id })
    if (found.length > 0) return found[0]
    throw new NotFoundError()
  }

  async function update (id, data, user, schema) {
    const item = await get(id, schema)
    const iAmPublisher = amIPublisher(user)
    const iCanDoIt = iAmPublisher || (
      (!iAmPublisher && item.status !== 'published' && item.author === user.id.toString()))
    if (!iCanDoIt) throw new NotAllowedError()
    const u = await getQB(knex, TABLE_NAMES.POSTS, schema).where({ id }).update(data).returning('*')
    return u[0]
  }

  async function setStatus (id, status, user, schema) {
    const item = await get(id, schema)
    const iAmPublisher = amIPublisher(user)
    const iCanDoIt = (
      iAmPublisher ||
      (!iAmPublisher && item.author === user.id.toString() && ['draft', 'review'].indexOf(status) >= 0)
    )
    if (!iCanDoIt) throw new NotAllowedError()
    // TODO: integrace do notify
    return getQB(knex, TABLE_NAMES.POSTS, schema).where({id}).update({ status })
  }

  async function list (query, schema) {
    query.filter = query.filter ? JSON.parse(query.filter) : {}
    const qb = getQB(knex, TABLE_NAMES.POSTS, schema)
    return listItems(query, qb)
  }

  async function feed (tag, schema) {
    const filter = {
      published: { gt: moment().subtract(7, 'days').toISOString() }
    }
    tag !== 'all' && Object.assign(filter, { tag: { like: `%${tag}%` } } )
    const qb = getQB(knex, TABLE_NAMES.POSTS, schema)
    const posts = await listItems({ filter }, qb)
    return generateFeed(posts).rss2()
  }
}