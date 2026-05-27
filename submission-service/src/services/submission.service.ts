import { ISubmission, ISubmissionData, SubmissionStatus } from "../models/submission.model";
import { ISubmissionRepository } from "../repositories/submission.repository";
import { NotFoundError } from "../utils/errors/app.error";

export interface ISubmissionService {
    // createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission>;
    getSubmissionById(id: string): Promise<ISubmission | null>;
    getSubmissionsByProblemId(problemId: string): Promise<ISubmission[]>;
    deleteSubmissionById(id: string): Promise<boolean>;
    updateSubmissionStatus(id: string, status: SubmissionStatus, submissionData: ISubmissionData): Promise<ISubmission | null>;
}

export class SubmissionService implements ISubmissionService {

    private submissionRepository: ISubmissionRepository;

    constructor(submissionRepository: ISubmissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    // async createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission> {
    //     return null
    // }

    async getSubmissionById(id: string): Promise<ISubmission | null> {
        const submission = await this.submissionRepository.findById(id);
        if(!submission) {
            throw new NotFoundError("Submission not found");
        }
        return submission;
    }

    async getSubmissionsByProblemId(problemId: string): Promise<ISubmission[]> {
        const submissions = await this.submissionRepository.findByProblemId(problemId);
        return submissions;
    }

    async deleteSubmissionById(id: string): Promise<boolean> {
        const result = await this.submissionRepository.deleteById(id);
        if(!result) {
            throw new NotFoundError("Submission not found");
        }
        return result;
    }

    async updateSubmissionStatus(id: string, status: SubmissionStatus, submissionData: ISubmissionData): Promise<ISubmission | null> {
        const submission = await this.submissionRepository.updateStatus(id, status, submissionData);
        if(!submission) {
            throw new NotFoundError("Submission not found");
        }
        return submission;
    }
    
    
}