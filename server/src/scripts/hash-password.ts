import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { db } from '../db/connection'; // Correct named import for the Knex instance

const username = process.argv[2]; // Get username from command line argument
const plainPassword = process.argv[3]; // Get password from command line argument

if (!username || !plainPassword) {
  logger.error('Usage: npm run hash:password -- <username> <your_password>');
  process.exit(1);
}

const saltRounds = 12; // Increased salt rounds slightly

async function upsertUserPassword() {
  try {
    logger.info(`Hashing password for user: ${username}`);
    const password_hash = await bcrypt.hash(plainPassword, saltRounds);

    logger.info('Upserting user into database...');
    // Use Knex 'onConflict' for upsert behavior (update if username exists, insert otherwise)
    // Note: This requires PostgreSQL 9.5+ or MySQL 5.7.6+
    await db('users') // Use the imported 'db' instance
      .insert({
        username: username,
        password_hash: password_hash,
      })
      .onConflict('username') // Specify the unique constraint column
      .merge(); // Merge updates the existing row

    logger.info(`User '${username}' password hashed and stored/updated successfully.`);

  } catch (error) {
    logger.error('Error hashing/storing password:', { username, error });
    process.exit(1);
  } finally {
    // Ensure the database connection is closed
    await db.destroy(); // Use the imported 'db' instance
    logger.info('Database connection closed.');
  }
}

upsertUserPassword(); 