import expressSanitize from "express-sanitizer";
import { Request, Response, NextFunction } from "express";

export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  expressSanitize.middleware()(req, res, () => {
    req.body = expressSanitize.sanitize(req.body);
    req.query = expressSanitize.sanitize(req.query);
    req.params = expressSanitize.sanitize(req.params);
    next();
  });
}