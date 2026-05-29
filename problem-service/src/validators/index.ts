import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
type AnyZodObject = ZodObject<any>;
import logger from "../config/logger.config";
import { BadRequestError } from "../utils/errors/app.error";

export const validateRequestBody = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            logger.info("Validating request body");
            await schema.parseAsync(req.body);
            logger.info("Request body is valid");
            next();

        } catch (error) {
            logger.error("Request body is invalid");
            next(new BadRequestError("Invalid request body"));
        }
    }
}

export const validateQueryParams = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            await schema.parseAsync(req.query);
            console.log("Query params are valid");
            next();

        } catch (error) {
            next(new BadRequestError("Invalid query params"));
        }
    }
}

export const validateRequestParams = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.params);
            next();
        }
        catch (error) {
            next(new BadRequestError("Invalid request params"));
        }
    }
}