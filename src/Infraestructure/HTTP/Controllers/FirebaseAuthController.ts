import { Request, Response } from "express";
import { RegistrarUsuarioFirebaseUseCase } from "../../../Application/UseCases/RegistrarUsuarioFirebaseUseCase";
import { LoginFirebaseUseCase } from "../../../Application/UseCases/LoginFirebaseUseCase";
import { RegistrarUsuarioFirebaseDTO, LoginFirebaseDTO } from "../../../Application/DTOs/DTOs";
import { AuthenticatedRequest } from "../../../Shared/middleware/auth-middleware";

export class FirebaseAuthController {
  constructor(
    private readonly registrarUsuarioFirebaseUseCase: RegistrarUsuarioFirebaseUseCase,
    private readonly loginFirebaseUseCase: LoginFirebaseUseCase
  ) {}

  async registrarUsuario(req: Request, res: Response): Promise<void> {
    try {
      
      const dto: RegistrarUsuarioFirebaseDTO = {
        email: req.body.email,
        displayName: req.body.displayName,
        phoneNumber: req.body.phoneNumber,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        idiomaPreferido: req.body.idiomaPreferido || "español",
        fcmToken: req.body.fcmToken,
        firebaseUid: req.body.firebaseUid,
        emailVerified: req.body.emailVerified || false
      };
      
      const resultado = await this.registrarUsuarioFirebaseUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente con Firebase",
        data: {
          id: resultado.id,
          email: dto.email,
          nombre: dto.nombre,
          apellido: dto.apellido
        }
      });
    } catch (error: any) {
      console.error("Error en registro con Firebase:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Error en el registro",
        error: error.toString()
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto: LoginFirebaseDTO = {
        idToken: req.body.idToken,
        fcmToken: req.body.fcmToken
      };

      const resultado = await this.loginFirebaseUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: "Login exitoso con Firebase",
        data: resultado
      });
    } catch (error: any) {
      console.error("Error en login con Firebase:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Error en la autenticación",
        error: error.toString()
      });
    }
  }

  async verificarToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Token válido",
        data: {
          userId: req.user.userId,
          email: req.user.email,
          firebaseUid: req.user.firebaseUid,
          tipoAutenticacion: req.user.tipoAutenticacion
        }
      });
    } catch (error: any) {
      console.error("Error en verificación de token:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.toString()
      });
    }
  }

  async obtenerPerfil(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Perfil obtenido exitosamente",
        data: {
          userId: req.user.userId,
          email: req.user.email,
          firebaseUid: req.user.firebaseUid,
          tipoAutenticacion: req.user.tipoAutenticacion
        }
      });
    } catch (error: any) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.toString()
      });
    }
  }
} 