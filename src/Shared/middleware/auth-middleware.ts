import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import admin from "../../Config/FireBase/faribase";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    firebaseUid?: string;
    tipoAutenticacion: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Verificar si es un token JWT de la aplicación o un token de Firebase
  if (token.includes(".") && token.split(".").length === 3) {
    // Es un token JWT de la aplicación
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        firebaseUid: decoded.firebaseUid,
        tipoAutenticacion: decoded.tipoAutenticacion || "local"
      };
      
      return next();
    } catch (jwtError) {
      // Si falla JWT, intentar con Firebase
      console.log("JWT verification failed, trying Firebase token");
    }
  }

  // Verificar token de Firebase
  try {
    admin.auth().verifyIdToken(token)
      .then((decodedToken) => {
        req.user = {
          userId: decodedToken.uid, // Usar UID como userId temporal
          email: decodedToken.email || "",
          firebaseUid: decodedToken.uid,
          tipoAutenticacion: "firebase"
        };
        
        next();
      })
      .catch((firebaseError) => {
        console.error("Firebase token verification failed:", firebaseError);
        res.status(401).json({ error: "Token inválido o expirado" });
        return;
      });
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
    return;
  }
}

// Middleware opcional para rutas que pueden ser públicas o autenticadas
export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Continuar sin autenticación
  }

  const token = authHeader.split(" ")[1];

  // Intentar verificar token JWT primero
  if (token.includes(".") && token.split(".").length === 3) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        firebaseUid: decoded.firebaseUid,
        tipoAutenticacion: decoded.tipoAutenticacion || "local"
      };
      
      return next();
    } catch (jwtError) {
      // Continuar sin autenticación si falla JWT
      return next();
    }
  }

  // Intentar verificar token de Firebase
  admin.auth().verifyIdToken(token)
    .then((decodedToken) => {
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email || "",
        firebaseUid: decodedToken.uid,
        tipoAutenticacion: "firebase"
      };
      next();
    })
    .catch((firebaseError) => {
      // Continuar sin autenticación si falla Firebase
      console.log("Firebase token verification failed, continuing without auth");
      next();
    });
}