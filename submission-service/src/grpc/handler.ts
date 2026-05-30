import * as grpc from "@grpc/grpc-js";
import { SubmissionRepository } from "../repositories/submission.repository";
import { SubmissionStatus } from "../models/submission.model";
import logger from "../config/logger.config";

const submissionRepository = new SubmissionRepository();

interface UpdateSubmissionRequest {
    submissionId: string;
    status:       string;
    output:       Record<string, string>;
}

interface UpdateSubmissionResponse {
    success: boolean;
    message: string;
}

export const submissionGrpcHandler = {

    async updateSubmission(
        call: grpc.ServerUnaryCall<UpdateSubmissionRequest, UpdateSubmissionResponse>,
        callback: grpc.sendUnaryData<UpdateSubmissionResponse>
    ) {
        try {
            const { submissionId, status, output } = call.request;
            logger.info(`gRPC updateSubmission`, { submissionId, status });

            await submissionRepository.updateStatus(
                submissionId,
                status as SubmissionStatus,
                output
            );

            callback(null, { success: true, message: "Submission updated" });

        } catch (error: any) {
            logger.error(`gRPC updateSubmission error: ${error.message}`);
            callback({
                code: grpc.status.INTERNAL,
                message: error.message,
            });
        }
    },
};