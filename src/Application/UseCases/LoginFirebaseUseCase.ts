import { Usuario } from "../../Domain/Aggregates/Usuario";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";
import { LoginFirebaseDTO, ResultadoLoginFirebaseDTO } from "../DTOs/DTOs";
import admin from "../../Config/FireBase/faribase";
import jwt from "jsonwebtoken";

export class LoginFirebaseUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: LoginFirebaseDTO): Promise<ResultadoLoginFirebaseDTO> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(dto.idToken);
      
      if (!decodedToken) {
        throw new Error("Token de Firebase inválido");
      }

      const usuario = await this.usuarioRepository.findByFirebaseUid(decodedToken.uid);
      
      if (!usuario) {
        throw new Error("Usuario no encontrado. Debe registrarse primero.");
      }

      usuario.actualizarUltimoLogin();

      if (dto.fcmToken) {
        usuario.establecerFcmToken(dto.fcmToken);
      }

      await this.usuarioRepository.save(usuario);

      const token = jwt.sign(
        {
          userId: usuario.id,
          email: usuario.email.getValue(),
          firebaseUid: usuario.firebaseUid,
          tipoAutenticacion: usuario.tipoAutenticacion
        },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "24h" }
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return {
        token,
        expiresAt,
        user: {
          uid: usuario.id!,
          email: usuario.email.getValue(),
          displayName: usuario.firebaseDisplayName,
          phoneNumber: usuario.firebasePhoneNumber,
          emailVerified: usuario.emailVerified
        }
      };
    } catch (error) {
      console.error("Error en login con Firebase:", error);
      throw new Error("Error de autenticación: " + error);
    }
  }
} 