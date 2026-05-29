import { NextFunction, Request, Response } from "express";
import { ProblemRepository } from "../repositories/problem.repository";
import { ProblemService } from "../services/problem.service";
const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);

export const ProblemController = {
    async createProblem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const problem = await problemService.createProblem(req.body);

            res.status(201).json({
                message: "Problem created successfully",
                data: problem,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async getProblemById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const problem = await problemService.getProblemById(req.params.id);
            res.status(200).json({
                message: "Problem fetched successfully",
                data: problem,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllProblems(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const problems = await problemService.getAllProblems();

            res.status(200).json({
                message: "Problems fetched successfully",
                data: problems,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async updateProblem(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const problem = await problemService.updateProblem(req.params.id, req.body);
            res.status(200).json({
                message: "Problem updated successfully",
                data: problem,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteProblem(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const problem = await problemService.deleteProblem(req.params.id);

            res.status(200).json({
                message: "Problem deleted successfully",
                data: problem,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async findByDifficulty(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const difficulty = req.params.difficulty as "easy" | "medium" | "hard";

            const problems = await problemService.findByDifficulty(difficulty);

            res.status(200).json({
                message: "Problems fetched successfully",
                data: problems,
                success: true
            });
        } catch (error) {
            next(error);
        }
    },

    async searchProblems(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const q = (req.query.query as string | undefined) ?? "";
            const problems = await problemService.searchProblems(q);

            res.status(200).json({
                message: "Problems fetched successfully",
                data: problems,
                success: true
            });
        } catch (error) {
            next(error);
        }
    }
}