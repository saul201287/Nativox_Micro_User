import { Usuario } from "../../Domain/Aggregates/Usuario";
import { TipoNotificacion } from "../../Domain/Services/ServicioDeNotificaciones";
import { IdiomaPreferido } from "../../Domain/ValueObjects/IdiomaPreferido";
import { Secret, sign } from "jsonwebtoken";

export interface RegistrarUsuarioDTO {
  nombre: string;
  apellido: string;
  email: string;
  phone: string;
  contrasena: string;
  idiomaPreferido: IdiomaPreferido;
  fcmToken: string;
}

export interface RegistrarUsuarioFirebaseDTO {
  email: string;
  displayName?: string;
  phoneNumber?: string;
  nombre: string;
  apellido: string;
  idiomaPreferido: IdiomaPreferido;
  fcmToken?: string;
  firebaseUid: string;
  emailVerified?: boolean;
}

export interface LoginDTO {
  email: string;
  contrasena: string;
}

export interface LoginFirebaseDTO {
  idToken: string;
  fcmToken?: string;
}

export interface ResultadoLoginDTO {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface ResultadoLoginFirebaseDTO {
  token: string;
  expiresAt: Date;
  user: {
    uid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    emailVerified: boolean;
  };
}

export interface ActualizarProgresoDTO {
  usuarioId: string;
  leccionId: string;
  porcentajeAvance: number;
}

export interface EnviarNotificacionDTO {
  usuarioId: string;
  mensaje: string;
  tipo?: TipoNotificacion;
}

export interface SolicitarRecuperacionContrasenaDTO {
  email: string;
}

export interface RestablecerContrasenaDTO {
  token: string;
  nuevaContrasena: string;
}

export interface ActualizarFcmTokenDTO {
  usuarioId: string;
  fcmToken: string;
}

export const generateAccesToken = (user: Usuario) => {
  const payload = {
    sub: user.id,
    email: user.email.getValue(),
    roles: user.firebaseUid,
    type: "access",
  };

 const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Private key is not defined in environment variables");
  }
/*
 const token = sign(payload, privateKey as Secret, {
   algorithm: 'RS256',
   expiresIn: process.env.ACCESSTOKEN_EXPIRATION,
   issuer: process.env.ISSUER,
   audience: process.env.AUDIENCE,
   keyid: process.env.KEYID,
 });
 return {
    token,
    expiresAt: new Date(Date.now() + parseInt(process.env.ACCESSTOKEN_EXPIRATION || "3600") * 1000),
  };
  */
};
