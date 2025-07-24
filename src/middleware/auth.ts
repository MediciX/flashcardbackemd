import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../util/jwt";

export interface JWTUser {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTUser;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "No token provided",
      error: "MISSING_TOKEN",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Invalid token format",
      error: "INVALID_TOKEN_FORMAT",
    });
    return;
  }

  try {
    const decoded = verifyToken(token) as JWTUser;

    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
        error: "INVALID_PAYLOAD",
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role || "user",
    };

    next();
  } catch (err: any) {
    let errorMessage = "Invalid or expired token";
    let errorCode = "INVALID_TOKEN";

    if (err.name === "TokenExpiredError") {
      errorMessage = "Token has expired";
      errorCode = "TOKEN_EXPIRED";
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Invalid token";
      errorCode = "INVALID_TOKEN";
    }

    res.status(401).json({
      success: false,
      message: errorMessage,
      error: errorCode,
    });
    return;
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
      error: "UNAUTHORIZED",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin only access",
      error: "INSUFFICIENT_PERMISSIONS",
    });
    return;
  }

  next();
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verifyToken(token) as JWTUser;

    if (decoded.userId) {
      req.user = {
        userId: decoded.userId,
        role: decoded.role || "user",
      };
    }
  } catch (err) {
    console.error("Optional auth failed:", err);
  }

  next();
}
