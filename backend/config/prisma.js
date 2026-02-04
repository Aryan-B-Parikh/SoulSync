/**
 * Prisma Client Configuration
 * Initializes the database client for PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
// Log queries in development for debugging
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;
