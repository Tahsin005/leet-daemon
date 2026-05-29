import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/contants";
import logger from "../config/logger.config";
import { EvaluationJob, EvaluationResult, TestCase } from "../interfaces/evaluation.interface";
import { bullmqRedisConnection } from "../config/redis.config";
import { updateSubmission } from "../api/submission.api";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";

type SubmissionStatus = "completed" | "pending" | "running" | "accepted" | "wrong_answer";

function matchTestCasesWithResults(testCases: TestCase[], results: EvaluationResult[]) {
    const output: Record<string, string> = {}
    if(results.length !== testCases.length) {
        console.log("WA");
        return { output, allAccepted: false };
    }

    let allAccepted = true;

    testCases.forEach((testCase, index) => {
        let retval = "";
        if(results[index].status === "time_limit_exceeded") {
            retval = "TLE";
            allAccepted = false;
        } else if (results[index].status === "failed") {
            retval = "Error";
            allAccepted = false;
        } else {
            // match the output with the test case output
            if(results[index].output === testCase.output) {
                retval = "AC";
            } else {
                retval = "WA";
                allAccepted = false;
            }
        }

        console.log("retval", retval);
        output[testCase._id] = retval;
    });

    return { output, allAccepted };
}

async function setupEvaluationWorker() {
  const worker = new Worker(SUBMISSION_QUEUE, async (job: Job) => { 
    logger.info(`Processing job ${job.id}`);

    const data: EvaluationJob = job.data;

    console.log("data", data);
    console.log("data.problem.testcases", data.problem.testcases);

    try {
        // mark as running as soon as the worker picks it up
        await updateSubmission(data.submissionId, "running" satisfies SubmissionStatus, {});

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
  
        const matched = matchTestCasesWithResults(data.problem.testcases, testCasesRunnerResults);
        const output = matched.output;
        const finalStatus: SubmissionStatus = matched.allAccepted ? "accepted" : "wrong_answer";

        console.log("output", output);

        await updateSubmission(data.submissionId, finalStatus, output || {});
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