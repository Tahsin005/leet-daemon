import * as grpc from "@grpc/grpc-js";
import { ProblemRepository } from "../repositories/problem.repository";
import { ProblemService } from "../services/problem.service";
import { GetProblemByIdRequest, GetProblemByIdResponse } from "./types";
import logger from "../config/logger.config";

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);

export const problemGrpcHandler = {

    async getProblemById(
        call: grpc.ServerUnaryCall<GetProblemByIdRequest, GetProblemByIdResponse>,
        callback: grpc.sendUnaryData<GetProblemByIdResponse>
    ) {
        try {
            const { problemId } = call.request;
            logger.info(`gRPC getProblemById`, { problemId });

            const problem = await problemService.getProblemById(problemId);

            callback(null, {
                problem: {
                    id:          problem!._id.toString(),
                    title:       problem!.title,
                    description: problem!.description,
                    difficulty:  problem!.difficulty,
                    editorial:   problem!.editorial ?? "",
                    testcases:   problem!.testcases.map((tc: any) => ({
                        id:     tc._id.toString(),
                        input:  tc.input,
                        output: tc.output,
                    })),
                },
            });

        } catch (error: any) {
            const isNotFound = error.name === "NotFoundError";
            callback({
                code: isNotFound ? grpc.status.NOT_FOUND : grpc.status.INTERNAL,
                message: error.message,
            });
        }
    },
};