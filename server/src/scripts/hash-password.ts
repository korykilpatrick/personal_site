import bcrypt from 'bcrypt';
import logger from '../utils/logger'; // Assuming logger exists

const plainPassword = process.argv[2]; // Get password from command line argument

if (!plainPassword) {
  logger.error('Usage: npm run hash:password -- <your_password>');
  process.exit(1);
}

const saltRounds = 10; // Or use a value from config

async function hashPassword() {
  try {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    console.log('PASSWORD_HASH=' + hash); // Output in .env format
    logger.info('Password hashed successfully.');
  } catch (error) {
    logger.error('Error hashing password:', { error });
    process.exit(1);
  }
}

hashPassword(); 