import express from 'express';
import { SubmissionFactory } from '../../factories/submission.factory';
import { validateRequestBody, validateQueryParams } from '../../validators';
import { 
    createSubmissionSchema, 
    updateSubmissionStatusSchema, 
    submissionQuerySchema 
} from '../../validators/submission.validator';

const submissionRouter = express.Router();

const submissionController = SubmissionFactory.getSubmissionController();

submissionRouter.post(
    '/', 
    validateRequestBody(createSubmissionSchema), 
    submissionController.createSubmission
);

submissionRouter.get(
    '/:id', 
    submissionController.getSubmissionById
);

submissionRouter.get(
    '/problem/:problemId', 
    validateQueryParams(submissionQuerySchema),
    submissionController.getSubmissionsByProblemId
);

submissionRouter.delete(
    '/:id', 
    submissionController.deleteSubmissionById
);

submissionRouter.patch(
    '/:id/status', 
    validateRequestBody(updateSubmissionStatusSchema),
    submissionController.updateSubmissionStatus
);

export default submissionRouter;
