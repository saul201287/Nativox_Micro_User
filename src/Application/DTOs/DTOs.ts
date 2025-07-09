import { User } from "../../Domain/Entities/User";
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

export interface LoginDTO {
  email: string;
  contrasena: string;
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
