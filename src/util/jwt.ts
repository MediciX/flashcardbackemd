import jwt from "jsonwebtoken";
const JWTkey = process.env.JWT_KEY || "";

// สร้าง token
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWTkey, { expiresIn: "7d" });
}

// ตรวจสอบ token และคืน payload
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWTkey);
  } catch (err) {
    throw new Error("Invalid token");
  }
}
