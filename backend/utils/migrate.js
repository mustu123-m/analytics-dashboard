const pool = require('./db');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        email       TEXT UNIQUE NOT NULL,
        password    TEXT NOT NULL,
        role        TEXT NOT NULL DEFAULT 'user',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Datasets metadata table
    await client.query(`
      CREATE TABLE IF NOT EXISTS datasets (
        file_id       TEXT PRIMARY KEY,
        user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name     TEXT NOT NULL,
        row_count     INT NOT NULL DEFAULT 0,
        column_count  INT NOT NULL DEFAULT 0,
        summary       JSONB,
        columns_meta  JSONB,
        uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Dataset rows stored as JSONB array (up to 10k rows)
    await client.query(`
      CREATE TABLE IF NOT EXISTS dataset_rows (
        file_id  TEXT PRIMARY KEY REFERENCES datasets(file_id) ON DELETE CASCADE,
        rows     JSONB NOT NULL DEFAULT '[]'
      );
    `);

    // AI insights cache — avoid re-calling Gemini for same dataset
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        file_id       TEXT PRIMARY KEY REFERENCES datasets(file_id) ON DELETE CASCADE,
        insights      JSONB NOT NULL,
        generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Database migrations complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = migrate;