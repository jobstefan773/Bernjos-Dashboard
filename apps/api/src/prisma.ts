import path from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

// Use adapter-based connection per Prisma 7+ requirements
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
