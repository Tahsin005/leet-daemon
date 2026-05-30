import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number
    PROBLEM_SERVICE_GRPC: string      
    SUBMISSION_SERVICE_GRPC: string 
}

function loadEnv() {
    dotenv.config();
    console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3003,
    PROBLEM_SERVICE_GRPC: process.env.PROBLEM_SERVICE_GRPC || "localhost:50051",
    SUBMISSION_SERVICE_GRPC: process.env.SUBMISSION_SERVICE_GRPC || "localhost:50052",
}