require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');

const WebSocket = require('ws');
neonConfig.webSocketConstructor = WebSocket;

// Optional: Enable querying via fetch for edge runtimes
// neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaNeon({ connectionString });

// Ensure we reuse the prisma instance in dev (avoids too many connections)
let prisma;

if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient({ adapter });
}

module.exports = prisma;
