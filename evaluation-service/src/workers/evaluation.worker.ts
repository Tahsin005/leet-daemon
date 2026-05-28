import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/contants";
import logger from "../config/logger.config";
import { EvaluationJob, EvaluationResult } from "../interfaces/evaluation.interface";
import { bullmqRedisConnection } from "../config/redis.config";
import { updateSubmission } from "../api/submission.api";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";

async function setupEvaluationWorker() {
  const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => { 
    logger.info(`Processing job ${job.id}`);

    const data: EvaluationJob = job.data;

    console.log("data", data);
    console.log("data.problem.testcases", data.problem.testcases);

    try {
        // run the code in a container and evaluate it against the test cases
        const testCasesRunnerPromise = data.problem.testcases.map(testcase => {
            return runCode({
                code: data.code,
                language: data.language,
                timeout: LANGUAGE_CONFIG[data.language].timeout,
                imageName: LANGUAGE_CONFIG[data.language].imageName,
                input: testcase.input
            });
        });

        const testCasesRunnerResults: EvaluationResult[] = await Promise.all(testCasesRunnerPromise);
        
        console.log("testCasesRunnerResults", testCasesRunnerResults);

        await updateSubmission(data.submissionId, "completed", {});
    } catch (error) {
      logger.error(`Evaluation job failed: ${job}`, error);
      return;
    }
  }, {
    connection: bullmqRedisConnection
  });

  worker.on("error", (error) => {
      logger.error(`Evaluation worker error: ${error}`);
  });

  worker.on("completed", (job) => {
      logger.info(`Evaluation job completed: ${job}`);
  });

  worker.on("failed", (job, error) => {
      logger.error(`Evaluation job failed: ${job}`, error);
  });
}

export async function startworkers() {
    await setupEvaluationWorker();
}