import { Email } from "../../Domain/ValueObjects/Email";
import { LoginDTO, ResultadoLoginDTO } from "../DTOs/DTOs";
import { ServicioDeAutenticacion } from "../../Domain/Services/ServicesAuth";
import { User } from "../../Domain/Entities/User";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";

export class LoginUseCase {
  constructor(
    private readonly servicioAutenticacion: ServicioDeAutenticacion,
    private readonly usuarioRepository: UsuarioRepository
  ) {}

  async execute(dto: LoginDTO): Promise<ResultadoLoginDTO> {
    try {
      const email = new Email(dto.email);
      const token = await this.servicioAutenticacion.login(
        email,
        dto.contrasena
      );
      const user = await this.usuarioRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      
      const result: ResultadoLoginDTO = {
        token: token.getToken(),
        expiresAt: token.getExpiresAt(),
        user: {
          id: user.id,
          firstName: user.nombre,
          lastName: user.apellido,
          email: user.email.getValue(),
          phone: user.phone.Number,
        },
      };
      return result;
    } catch (error) {
      throw new Error("Login failed");
    }
  }
}
