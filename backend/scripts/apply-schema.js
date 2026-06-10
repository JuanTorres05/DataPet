import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  console.log('Connecting to MySQL database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'datavet',
    multipleStatements: true
  });

  const schemaPath = path.resolve('../database/schema.sql');
  console.log(`Reading schema from ${schemaPath}...`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying schema statements...');
  await conn.query(schemaSql);
  console.log('Schema applied successfully.');

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
