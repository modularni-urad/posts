const Knex = require('knex')

export default async function initDB () {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true
  }
  const knex = Knex(opts)

  return knex
}
