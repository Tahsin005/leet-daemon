import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number
    DB_URL: string
    REDIS_URL: string
    PROBLEM_SERVICE_GRPC: string
    GRPC_PORT: number
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3002,
    DB_URL: process.env.DB_URL || "mongodb://...",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    PROBLEM_SERVICE_GRPC: process.env.PROBLEM_SERVICE_GRPC || "localhost:50051",
    GRPC_PORT: Number(process.env.GRPC_PORT) || 50052, 
}