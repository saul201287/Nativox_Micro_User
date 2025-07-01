import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lolalatrailera"; 

export class TokenDeAutenticacion {
  private readonly token: string;
  private readonly expiresAt: Date;

  constructor(token?: string, expiresAt?: Date) {
    if (token) {
      this.token = token;
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      this.expiresAt = new Date(decoded.exp * 1000);
    } else {
      this.expiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.token = jwt.sign(
        { exp: Math.floor(this.expiresAt.getTime() / 1000) },
        JWT_SECRET
      );
    }
  }

  getToken(): string {
    return this.token;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  isExpired(): boolean {
    try {
      jwt.verify(this.token, JWT_SECRET);
      return false;
    } catch {
      return true;
    }
  }
}
