import { TipoNotificacion } from "../../Domain/Services/ServicioDeNotificaciones";
import { IdiomaPreferido } from "../../Domain/ValueObjects/IdiomaPreferido";

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
  idToken: string; // Token de Firebase Auth
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
