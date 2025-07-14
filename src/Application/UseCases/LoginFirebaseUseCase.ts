import { LoginFirebaseDTO, ResultadoLoginFirebaseDTO } from "../DTOs/DTOs";
import { FirebaseAuthService } from "../../Domain/Services/FirebaseAuthService";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";

export class LoginFirebaseUseCase {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usuarioRepository: UsuarioRepository
  ) {}

  async execute(dto: LoginFirebaseDTO): Promise<ResultadoLoginFirebaseDTO> {
    try {
      const firebaseUser = await this.firebaseAuthService.verificarToken(dto.idToken);

      const email = new Email(firebaseUser.email);
      const usuario = await this.usuarioRepository.findByEmail(email);

      if (!usuario) {
        throw new Error("Usuario no encontrado en nuestra base de datos");
      }

      const customToken = await this.firebaseAuthService.obtenerUsuarioPorUid(firebaseUser.uid);

      return {
        token: dto.idToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          phoneNumber: firebaseUser.phoneNumber,
          emailVerified: firebaseUser.emailVerified,
        },
      };
    } catch (error) {
      console.error("Error en login Firebase:", error);
      throw new Error(`Error en login: ${error}`);
    }
  }
} 