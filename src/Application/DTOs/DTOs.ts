import { TipoNotificacion } from "../../Domain/Services/ServicioDeNotificaciones";
import { IdiomaPreferido } from "../../Domain/ValueObjects/IdiomaPreferido";

export interface RegistrarUsuarioDTO {
  nombre: string;
  email: string;
  phone: string;
  contrasena: string;
  idiomaPreferido: IdiomaPreferido;
}

export interface LoginDTO {
  email: string;
  contrasena: string;
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
