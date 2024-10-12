/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create the Users table with corrected column names (id as primary key)
  pgm.createTable('users', {
    id: 'id', // SERIAL PRIMARY KEY in shorthand
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(150)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true }, // Add password column
    createdAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  // Create index on email for specific cases like login, but prioritize id for most lookups
  pgm.createIndex('users', 'email', { ifNotExists: true });

  // Create the Posts table with corrected column names and added updatedAt column
  pgm.createTable('posts', {
    id: 'id', // SERIAL PRIMARY KEY in shorthand
    userId: {
      type: 'integer',
      notNull: true,
      references: '"users"', // foreign key reference to Users
      onDelete: 'cascade',
    },
    title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text', notNull: true },
    createdAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
    updatedAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'), // Set default to current time, can be updated later
    },
  });

  // Create indexes for optimized queries on userId, createdAt, and updatedAt
  pgm.createIndex('posts', 'userId', { ifNotExists: true });
  pgm.createIndex('posts', 'createdAt', { ifNotExists: true });
  pgm.createIndex('posts', 'updatedAt', { ifNotExists: true });

  // Create the Comments table with corrected column names
  pgm.createTable('comments', {
    id: 'id', // SERIAL PRIMARY KEY in shorthand
    postId: {
      type: 'integer',
      notNull: true,
      references: '"posts"', // foreign key reference to Posts
      onDelete: 'cascade',
    },
    userId: {
      type: 'integer',
      references: '"users"', // foreign key reference to Users
      onDelete: 'set null', // optional as comments can be anonymous
    },
    content: { type: 'text', notNull: true },
    createdAt: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });

  // Create indexes for optimized queries on postId, userId, and createdAt
  pgm.createIndex('comments', 'postId', { ifNotExists: true });
  pgm.createIndex('comments', 'userId', { ifNotExists: true });
  pgm.createIndex('comments', 'createdAt', { ifNotExists: true });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop tables in reverse order to maintain foreign key constraints
  pgm.dropTable('comments');
  pgm.dropTable('posts');
  pgm.dropTable('users');
};
