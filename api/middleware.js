import entityMWBase from 'entity-api-base'
// import axios from 'axios'
import { remove as removeDiacritics } from 'diacritics'
import slugify from 'slugify'
import _ from 'underscore'
import { TABLE_NAMES, GROUPS, getQB } from '../consts'
import generateFeed from './feeds'
import moment from 'moment'

const conf = {
  tablename: TABLE_NAMES.POSTS,
  editables: ['title', 'perex', 'image', 'tags', 'content', 'published'],
}

export default (ctx) => {
  const { knex, ErrorClass } = ctx
  const entityMW = entityMWBase(conf, knex, ErrorClass)

  return { create, list, update, feed, doimport, setStatus }
  
  async function create (body, user, schema) {
    entityMW.check_data(body)
    Object.assign(body, { 
      author: user.id,
      slug: body.title ? slugify(removeDiacritics(body.title)) : null
    })
    return entityMW.create(body, schema)
  }

  function doimport (body, schema) {
    body = _.omit(body, 'id')
    body.slug = body.slug ? body.slug : slugify(removeDiacritics(body.title))
    return entityMW.create(body, schema)
  }

  function amIPublisher (user) {
    return Boolean(user.groups && user.groups.find(i => i === GROUPS.PUBLISHERS))
  }

  async function update (id, data, user, schema) {
    const item = await entityMW.get(id, schema)
    const iAmPublisher = amIPublisher(user)
    const iCanDoIt = iAmPublisher || (
      (!iAmPublisher && item.status !== 'published' && item.author === user.id.toString()))
    if (!iCanDoIt) throw new ErrorClass(403, 'you cannot do it')
    return entityMW.update(id, data, schema)
  }

  async function setStatus (id, status, user, schema) {
    const item = await entityMW.get(id, schema)
    const iAmPublisher = amIPublisher(user)
    const iCanDoIt = (
      iAmPublisher ||
      (!iAmPublisher && item.author === user.id.toString() && ['draft', 'review'].indexOf(status) >= 0)
    )
    if (!iCanDoIt) throw new ErrorClass(403, 'you cannot do it')
    // TODO: integrace do notify
    return getQB(knex, TABLE_NAMES.POSTS, schema).where({id}).update({ status })
  }

  async function list (query, schema) {
    return entityMW.list(query, schema)
  }

  async function feed (tag, schema) {
    const filter = {
      published: { gt: moment().subtract(7, 'days').toISOString() }
    }
    tag !== 'all' && Object.assign(filter, { tag: { like: `%${tag}%` } } )
    const posts = await entityMW.list({ filter }, schema)
    return generateFeed(posts).rss2()
  }
}