import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { serverConfig } from "../config";
import logger from "../config/logger.config";

const PROTO_PATH = path.resolve(__dirname, "../../../proto/submission.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

export type SubmissionStatus = "completed" | "pending" | "running" | "accepted" | "wrong_answer";

let client: any = null;

function getClient() {
    if (!client) {
        client = new proto.submission.SubmissionService(
            serverConfig.SUBMISSION_SERVICE_GRPC,
            grpc.credentials.createInsecure()
        );
        logger.info(`gRPC submission client connected to ${serverConfig.SUBMISSION_SERVICE_GRPC}`);
    }
    return client;
}

export function updateSubmission(
    submissionId: string,
    status: SubmissionStatus,
    output: Record<string, string>
): Promise<void> {
    return new Promise((resolve, reject) => {
        getClient().updateSubmission({ submissionId, status, output }, (error: any) => {
            if (error) {
                logger.error(`gRPC updateSubmission failed: ${error.message}`);
                return reject(error);
            }
            logger.info(`gRPC updateSubmission success`, { submissionId, status });
            resolve();
        });
    });
}