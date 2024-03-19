import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('email', 50).notNullable().unique()
      table.string('password').notNullable()
      table.string('area', 25).notNullable()
      table.string('tel', 10).notNullable()
      table.string('img').notNullable()
      table.string('des', 255).nullable()
      table.boolean('enabled').defaultTo(false)
      table.boolean('isAdmin').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.integer('job_id').unsigned().references('jobs.id').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
