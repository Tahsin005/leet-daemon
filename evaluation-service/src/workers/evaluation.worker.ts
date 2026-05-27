import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/contants";
import logger from "../config/logger.config";
import { EvaluationJob } from "../interfaces/evaluation.interface";
import { bullmqRedisConnection } from "../config/redis.config";

async function setupEvaluationWorker() {
  const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => { 
    logger.info(`Processing job ${job.id}`);

    const data: EvaluationJob = job.data;

    console.log("data", data);
    console.log("data.problem.testcases", data.problem.testcases);

    try {
        // run the code in a container and evaluate it against the test cases
        
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