import { TABLE_NAMES } from '../consts'

exports.up = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema

  return builder.createTable(TABLE_NAMES.POSTS, (table) => {
    table.increments('id').primary()
    table.string('uuid', 36)
    table.string('title', 512).notNullable()
    table.string('slug', 512).notNullable().unique()
    table.string('perex', 1024).notNullable()
    table.string('image')
    table.string('tags').notNullable()
    table.string('author').notNullable()
    table.string('publisher')
    table.text('content').notNullable()
    table.timestamp('published')
    table.string('status', 16).notNullable().defaultTo('draft')
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  })
}

exports.down = (knex, Promise) => {
  const builder = process.env.CUSTOM_MIGRATION_SCHEMA
    ? knex.schema.withSchema(process.env.CUSTOM_MIGRATION_SCHEMA)
    : knex.schema

  return builder.dropTable(TABLE_NAMES.POSTS)
}

