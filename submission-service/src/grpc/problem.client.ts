import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { serverConfig } from "../config";
import logger from "../config/logger.config";

const PROTO_PATH = path.resolve(__dirname, "../../../proto/problem.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef) as any;

export interface ITestcase {
    id:     string;
    input:  string;
    output: string;
}

export interface IProblemDetails {
    id:          string;
    title:       string;
    description: string;
    difficulty:  string;
    editorial:   string;
    testcases:   ITestcase[];
}

// singleton client 

let client: any = null;

function getClient() {
    if (!client) {
        client = new proto.problem.ProblemService(
            serverConfig.PROBLEM_SERVICE_GRPC,
            grpc.credentials.createInsecure()
        );
        logger.info(`gRPC problem client connected to ${serverConfig.PROBLEM_SERVICE_GRPC}`);
    }
    return client;
}

export function getProblemById(problemId: string): Promise<IProblemDetails | null> {
    return new Promise((resolve, reject) => {
        getClient().getProblemById({ problemId }, (error: any, response: any) => {
            if (error) {
                logger.error(`gRPC getProblemById failed: ${error.message}`);
                return resolve(null);  // matches old HTTP behaviour on failure
            }
            resolve(response.problem ?? null);
        });
    });
}