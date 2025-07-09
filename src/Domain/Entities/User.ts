import { Email } from "../ValueObjects/Email";
import { Phone } from "../ValueObjects/Phone";

export class User {
  constructor(private readonly props: {
    id: string;
    email: Email;
    firstName: string;
    lastName: string;
    phone: Phone;
    createdAt: Date;
    lastLoginAt?: Date;
    fcmToken?: string; 
  }) {}

  public login(): void {
    this.props.lastLoginAt = new Date();
  }
}
