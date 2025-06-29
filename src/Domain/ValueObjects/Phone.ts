import { DomainError } from "../../Shared/errors/domain-error";

export class Phone {
  constructor(
    private readonly number: string,
    private readonly isVerified: boolean
  ) {
    if (!this.isValidPhone(number)) {
      throw new DomainError(
        "El número de teléfono debe tener exactamente 10 dígitos numéricos."
      );
    }
  }

  public static create(number: string, isVerified: boolean = false): Phone {
    return new Phone(number, isVerified);
  }

  private isValidPhone(number: string): boolean {
    const regex = /^\d{10}$/;
    return regex.test(number);
  }

  get Number(): string {
    return this.number;
  }

  get IsVerified(): boolean {
    return this.isVerified;
  }
}
