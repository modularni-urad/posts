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

  async function doimport (body, schema) {
    return Promise.all(body.map(i => {
      const data = _.omit(i, 'id')
      data.slug = data.slug ? data.slug : slugify(removeDiacritics(data.title))
      return entityMW.create(data, schema).catch(err => {
        return err.toString()
      })
    }))
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