
export const TABLE_NAMES = {
  POSTS: 'posts'
}

export const GROUPS = {
  PUBLISHERS: 'post_publishers',
  IMPORTERS: 'post_importers'
}

export const STATUSES = {
  DRAFT: 'draft',
  REVIEW: 'review',
  RETURNED: 'returned',
  PUBLISHED: 'published'
}

export function getQB (knex, tablename, schema) {
  return schema
    ? knex(knex.ref(tablename).withSchema(schema))
    : knex(tablename)
}