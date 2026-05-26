import dotenv from 'dotenv';

type ServerConfig = {
  PORT: number
  DB_URL: string
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    DB_URL: process.env.DB_URL || "mongodb://root:secret@localhost:27017/lcdb?authSource=admin",
}