import entityMWBase from 'entity-api-base'
// import axios from 'axios'
import { remove as removeDiacritics } from 'diacritics'
import slugify from 'slugify'
import _ from 'underscore'
import { TABLE_NAMES } from '../consts'
import generateFeed from './feeds'
import moment from 'moment'

const conf = {
  tablename: TABLE_NAMES.POSTS,
  editables: ['title', 'perex', 'image', 'tags', 'content', 'published'],
}

export default (ctx) => {
  const { knex, ErrorClass } = ctx
  const entityMW = entityMWBase(conf, knex, ErrorClass)

  return { create, list, update, feed, doimport }
  
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

  async function update (filename, data, user, schema) {
    return entityMW.update(filename, data, schema)
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