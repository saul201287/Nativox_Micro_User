import { Request, Response } from "express";
import { RegistrarUsuarioFirebaseUseCase } from "../../../Application/UseCases/RegistrarUsuarioFirebaseUseCase";
import { LoginFirebaseUseCase } from "../../../Application/UseCases/LoginFirebaseUseCase";
import { FirebaseAuthService } from "../../../Domain/Services/FirebaseAuthService";
import { body, validationResult } from "express-validator";

export class FirebaseAuthController {
  constructor(
    private readonly registrarUsuarioFirebaseUseCase: RegistrarUsuarioFirebaseUseCase,
    private readonly loginFirebaseUseCase: LoginFirebaseUseCase,
    private readonly firebaseAuthService: FirebaseAuthService
  ) {}

  static registerValidation = [
    body("email").isEmail().withMessage("Email válido requerido"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("La contraseña debe tener al menos 8 caracteres"),
    body("nombre").notEmpty().withMessage("Nombre requerido"),
    body("apellido").notEmpty().withMessage("Apellido requerido"),
    body("idiomaPreferido")
      .isIn(["español", "tzeltal", "zapoteco"])
      .withMessage("Idioma preferido debe ser español, tzeltal o zapoteco"),
  ];

  static loginValidation = [
    body("idToken").notEmpty().withMessage("Token de Firebase requerido"),
  ];

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
        return;
      }

      const {
        email,
        password,
        nombre,
        apellido,
        phoneNumber,
        idiomaPreferido,
        fcmToken,
      } = req.body;

      const result = await this.registrarUsuarioFirebaseUseCase.execute({
        email,
        password,
        nombre,
        apellido,
        phoneNumber,
        idiomaPreferido,
        fcmToken,
      });

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: result,
      });
    } catch (error: any) {
      console.error("Error en registro Firebase:", error);

      if (error.message.includes("ya está registrado")) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message.includes("débil")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
        return;
      }

      const { idToken } = req.body;

      const result = await this.loginFirebaseUseCase.execute({ idToken });

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: result,
      });
    } catch (error: any) {
      console.error("Error en login Firebase:", error);

      if (error.message.includes("no encontrado")) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (error.message.includes("Token expirado") || error.message.includes("Token inválido")) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Token de autorización requerido",
        });
        return;
      }

      const token = authHeader.substring(7);
      const user = await this.firebaseAuthService.verificarToken(token);

      res.status(200).json({
        success: true,
        message: "Token válido",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error al verificar token:", error);

      if (error.message.includes("Token expirado")) {
        res.status(401).json({
          success: false,
          message: "Token expirado",
        });
        return;
      }

      if (error.message.includes("Token inválido")) {
        res.status(401).json({
          success: false,
          message: "Token inválido",
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: "Token no válido",
      });
    }
  };

  sendEmailVerification = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.firebaseUser) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      await this.firebaseAuthService.enviarEmailVerificacion(req.firebaseUser.uid);

      res.status(200).json({
        success: true,
        message: "Email de verificación enviado",
      });
    } catch (error: any) {
      console.error("Error al enviar email de verificación:", error);

      res.status(500).json({
        success: false,
        message: "Error al enviar email de verificación",
      });
    }
  };

  sendPasswordResetEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email requerido",
        });
        return;
      }

      await this.firebaseAuthService.enviarEmailRestablecimiento(email);

      res.status(200).json({
        success: true,
        message: "Email de restablecimiento enviado",
      });
    } catch (error: any) {
      console.error("Error al enviar email de restablecimiento:", error);

      res.status(500).json({
        success: false,
        message: "Error al enviar email de restablecimiento",
      });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.firebaseUser) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const user = await this.firebaseAuthService.obtenerUsuarioPorUid(req.firebaseUser.uid);

      res.status(200).json({
        success: true,
        message: "Información del usuario obtenida",
        data: { user },
      });
    } catch (error: any) {
      console.error("Error al obtener usuario:", error);

      res.status(500).json({
        success: false,
        message: "Error al obtener información del usuario",
      });
    }
  };
} 