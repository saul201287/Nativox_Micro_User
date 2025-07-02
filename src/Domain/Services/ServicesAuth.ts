import { UsuarioRepository, EventPublisher } from "../Repositories/Ports";
import { Email } from "../ValueObjects/Email";
import { TokenDeAutenticacion } from "../ValueObjects/TokenDeAutenticacion";

export class ServicioDeAutenticacion {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private eventPublisher: EventPublisher
  ) {}

  async login(email: Email, contrasena: string): Promise<TokenDeAutenticacion> {
    const usuario = await this.usuarioRepository.findByEmail(email);

    if (!usuario?.id) {
      throw new Error("Credenciales inválidas");
    }
   
    const esValida = await usuario.verificarContrasena(contrasena);
   
    if (!esValida) {
      throw new Error("Credenciales inválidas");
    }
    
    return new TokenDeAutenticacion();
  }

  async renovarToken(
    tokenActual: TokenDeAutenticacion
  ): Promise<TokenDeAutenticacion> {
    if (tokenActual.isExpired()) {
      throw new Error("Token expirado");
    }
    return new TokenDeAutenticacion();
  }

  logout(token: TokenDeAutenticacion): void {
    // TODO: Invalidar token (implementar blacklist si es necesario)
    console.log(`Token ${token.getToken()} invalidado`);
  }
}
