import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { problemGrpcHandler } from "./handler";
import logger from "../config/logger.config";

const PROTO_PATH = path.resolve(__dirname, "../../../proto/problem.proto");

export function startGrpcServer(port: number) {
    const packageDef = protoLoader.loadSync(PROTO_PATH, {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDef) as any;
    const server = new grpc.Server();

    server.addService(
        proto.problem.ProblemService.service,
        problemGrpcHandler
    );

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, boundPort) => {
            if (err) {
                logger.error(`gRPC server failed to start: ${err.message}`);
                return;
            }
            logger.info(`gRPC server listening on port ${boundPort}`);
        }
    );
}