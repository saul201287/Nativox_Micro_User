import { Request, Response, NextFunction } from "express";
import { FirebaseAuthService } from "../../Domain/Services/FirebaseAuthService";

declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email: string;
        displayName?: string;
        phoneNumber?: string;
        emailVerified: boolean;
      };
    }
  }
}

export class FirebaseAuthMiddleware {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const firebaseUser = await this.firebaseAuthService.verificarToken(token);

      req.firebaseUser = firebaseUser;

      next();
    } catch (error: any) {
      console.error("Error en autenticación Firebase:", error);

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
        message: "No autorizado",
      });
    }
  };

  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const firebaseUser = await this.firebaseAuthService.verificarToken(token);
        req.firebaseUser = firebaseUser;
      }

      next();
    } catch (error) {
      console.warn("Error en autenticación opcional:", error);
      next();
    }
  };

  requireEmailVerified = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.firebaseUser) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }

    if (!req.firebaseUser.emailVerified) {
      res.status(403).json({
        success: false,
        message: "Email no verificado",
      });
      return;
    }

    next();
  };

  requireOwnership = (paramName: string = "userId") => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.firebaseUser) {
        res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
        return;
      }

      const resourceUserId = req.params[paramName] || req.body[paramName];
      
      if (!resourceUserId) {
        res.status(400).json({
          success: false,
          message: `Parámetro ${paramName} requerido`,
        });
        return;
      }

      // Aquí podrías implementar lógica adicional para verificar propiedad
      // Por ejemplo, buscar en la base de datos si el usuario tiene acceso al recurso
      
      next();
    };
  };
} 