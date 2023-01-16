/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users',function(table){
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('username', 20).notNullable().index().unique();
    table.string('email',50).notNullable().unique();
    table.string('password').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
  await knex.schema.createTable('permissions',function(table){
    table.increments('id').primary();
    table.string('name').notNullable().unique();
  })
  await knex.schema.createTable('roles',function(table){
    table.increments('id').primary();
    table.string('name').notNullable().unique();
  })
  await knex.schema.createTable('role_permissions',function(table){
    table.integer('role_id',5).primary();
    table.integer('permission_id',5).primary();
    table.foreign('role_id').references('id').inTable('roles').onDelete('cascade');
    table.foreign('permission_id').references('id').inTable('permissions').onDelete('cascade');
    table.index(['role_id','permission_id'])
  })
  await knex.schema.createTable('user_roles',function(table){
    table.uuid('user_id').primary();
    table.integer('role_id',5).primary();
    table.foreign('user_id').references('id').inTable('users').onDelete('cascade');
    table.foreign('role_id').references('id').inTable('roles').onDelete('cascade');
    table.index(['role_id','user_id'])
  })
  await knex.schema.createTable('tags',function(table){
    table.bigIncrements('id').primary();
    table.string('slug').notNullable().unique().index();
    table.string('name').notNullable().unique();
  })
  await knex.schema.createTable('categories',function(table){
    table.bigIncrements('id').primary();
    table.string('slug').notNullable().unique().index();
    table.string('name').notNullable().unique();
    table.bigInteger('parent_id').unsigned().nullable().index();
    table.foreign('parent_id').references('id').inTable('categories').onDelete('set null');
  })
  await knex.schema.createTable('media',function(table){
    table.bigIncrements('id').primary();
    table.string('filename').notNullable();
    table.string('mime').notNullable();
    table.bigInteger('size_in_bytes',20).notNullable();
    table.text('description', 600).notNullable().defaultTo('');
    table.string('path').notNullable().unique().index();
    table.uuid('created_by').nullable().index();
    table.uuid('updated_by').nullable().index();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('created_by').references('id').inTable('users').onDelete('set null');
    table.foreign('updated_by').references('id').inTable('users').onDelete('set null');
  })
  // page
  await knex.schema.createTable('page_types',function(table){
    table.increments('id').primary();
    table.string('name').notNullable().index().unique();
  })
  await knex.schema.createTable('pages',function(table){
    table.bigIncrements('id').primary();
    table.integer('page_type_id').unsigned().index();
    table.string('title').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.bigInteger('content_id').unsigned().unique().index();
    table.text('excerpt', 1000).notNullable().defaultTo('');
    table.string('meta_title', 160).notNullable().defaultTo('');
    table.text('meta_description', 1000).notNullable().defaultTo('');
    table.bigInteger('hero_media_id').nullable().index();
    table.uuid('created_by').nullable().index();
    table.uuid('updated_by').nullable().index();
    table.uuid('published_by').nullable().index();
    table.timestamp('published_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('created_by').references('id').inTable('users').onDelete('set null');
    table.foreign('updated_by').references('id').inTable('users').onDelete('set null');
    table.foreign('published_by').references('id').inTable('users').onDelete('set null');
    table.foreign('hero_media_id').references('id').inTable('media').onDelete('set null');
    table.foreign('page_type_id').references('id').inTable('page_types').onDelete('set null');
  })
  await knex.schema.createTable('contents',function(table){
    table.bigIncrements('id').primary();
    table.bigInteger('page_id').notNullable().unsigned().index();
    table.text('content', 8000).notNullable().defaultTo('');
    table.uuid('created_by').nullable().index();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.foreign('created_by').references('id').inTable('users').onDelete('set null')
    table.foreign('page_id').references('id').inTable('pages').onDelete('cascade')
  })
  await knex.schema.alterTable('pages', function(table){
    table.foreign('content_id').references('id').inTable('contents').onDelete('set null');
  })
  await knex.schema.createTable('page_slugs',function(table){
    table.bigInteger('page_id').primary();
    table.string('slug').primary()
    table.foreign('page_id').references('id').inTable('pages').onDelete('cascade')
    table.index(['page_id','slug'])
  })
  await knex.schema.createTable('page_tags',function(table){
    table.bigInteger('page_id').unsigned().primary();
    table.bigInteger('tag_id').unsigned().primary();
    table.foreign('page_id').references('id').inTable('pages').onDelete('cascade')
    table.foreign('tag_id').references('id').inTable('tags').onDelete('cascade')
    table.index(['page_id','tag_id'])
  })
  await knex.schema.createTable('page_categories',function(table){
    table.bigInteger('page_id').unsigned().primary();
    table.bigInteger('category_id').unsigned().primary();
    table.foreign('page_id').references('id').inTable('pages').onDelete('cascade')
    table.foreign('category_id').references('id').inTable('categories').onDelete('cascade')
    table.index(['page_id','category_id'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  if(await knex.schema.hasColumn('contents','page_id')){
    await knex.schema.table('contents', async function(table){
      await table.dropForeign('page_id')
    })
  }
  if(await knex.schema.hasColumn('pages','content_id')){
    await knex.schema.table('pages', async function(table){
      await table.dropForeign('content_id')
    })
  }
  await knex.schema.dropTableIfExists('page_categories');
  await knex.schema.dropTableIfExists('page_tags');
  await knex.schema.dropTableIfExists('page_slugs');
  await knex.schema.dropTableIfExists('contents');
  await knex.schema.dropTableIfExists('pages');
  await knex.schema.dropTableIfExists('page_types');
  await knex.schema.dropTableIfExists('media');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('users');
};
