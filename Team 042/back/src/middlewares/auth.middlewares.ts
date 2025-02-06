import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Client } from "../models/clients.schema";
import { ApiError } from "../util/apiError";
import { MSSP } from "../models/mssp.schema";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken: any = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

    const user = await MSSP.findById(decodedToken?.userId).select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
};
