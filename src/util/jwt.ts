import jwt, { JwtPayload } from "jsonwebtoken";

const JWTkey = process.env.JWT_KEY!;

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWTkey, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWTkey);
  } catch (err) {
    throw new Error("Invalid token");
  }
}
