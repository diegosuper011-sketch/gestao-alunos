const { Pool } = require('pg');
    require('dotenv').config();

    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestao_alunos'
    });

    async function initDb() {
      await pool.query(`
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  course VARCHAR(120) NOT NULL,
  class_name VARCHAR(40) NOT NULL,
  attendance NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (attendance BETWEEN 0 AND 100),
  grade NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (grade BETWEEN 0 AND 10),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);
      console.log('Banco de dados preparado.');
    }

    module.exports = { pool, initDb };
