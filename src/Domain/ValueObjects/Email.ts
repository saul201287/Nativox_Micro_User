export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validateFormat(email);
    this.value = email.toLowerCase().trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private validateFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }
  }
}