import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
export * from '../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());

export default prisma;