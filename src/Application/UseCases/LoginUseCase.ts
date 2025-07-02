import { Email } from "../../Domain/ValueObjects/Email";
import { LoginDTO } from "../DTOs/DTOs";
import { ServicioDeAutenticacion } from "../../Domain/Services/ServicesAuth";

export class LoginUseCase {
  constructor(private servicioAutenticacion: ServicioDeAutenticacion) {}

  async execute(dto: LoginDTO): Promise<{ token: string; expiresAt: Date }> {
    const email = new Email(dto.email);
    const token = await this.servicioAutenticacion.login(email, dto.contrasena);
    
    return {
      token: token.getToken(),
      expiresAt: token.getExpiresAt(),
    };
  }
}
