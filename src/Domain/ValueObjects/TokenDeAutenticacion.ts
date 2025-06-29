import * as crypto from "crypto";

export class TokenDeAutenticacion {
  private readonly token: string;
  private readonly expiresAt: Date;

  constructor(token?: string, expiresAt?: Date) {
    this.token = token || this.generateToken();
    this.expiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  getToken(): string {
    return this.token;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}
