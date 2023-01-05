const Knex = require('knex')

export default async function initDB () {
  const opts = {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true
  }
  const knex = Knex(opts)

  // knex.on( 'query', function( queryData ) {
  //   console.log( queryData.sql )
  //   console.log( queryData.bindings )
  // })

  return knex
}
