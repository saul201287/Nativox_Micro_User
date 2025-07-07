import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

export function sanitizeInputs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body = matchedData(req, { locations: ["body"], includeOptionals: true });
  req.query = matchedData(req, {
    locations: ["query"],
    includeOptionals: true,
  });
  req.params = matchedData(req, {
    locations: ["params"],
    includeOptionals: true,
  });
  next();
}
