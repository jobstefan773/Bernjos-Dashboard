import path from 'node:path';
import { config as loadEnv } from 'dotenv';

// Load environment variables for Prisma CLI (migrate/generate)
loadEnv({ path: path.resolve(__dirname, './.env') });

// Minimal Prisma config object; Prisma CLI will read this file.
const prismaConfig = {
  datasource: {
    url: process.env.DATABASE_URL
  }
};

export default prismaConfig;
