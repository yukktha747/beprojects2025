import { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/apiError";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: err.message || "Internal server error",
  });
};

export {errorHandler};
