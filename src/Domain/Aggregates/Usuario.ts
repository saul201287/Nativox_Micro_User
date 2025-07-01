import * as bcrypt from "bcrypt";
import { ProgresoUsuario } from "../Entities/ProgresoUsuario";
import { Notificacion } from "../Entities/Notificacion";
import { Email } from "../ValueObjects/Email";
import { IdiomaPreferidoVO } from "../ValueObjects/IdiomaPreferido";
import { Phone } from "../ValueObjects/Phone";

export class Usuario {
  private _progresos: ProgresoUsuario[] = [];
  private _notificaciones: Notificacion[] = [];

  constructor(
    private _id: string,
    private _nombre: string,
    private _email: Email,
    private _phone: Phone,
    private _contrasenaHash: string,
    private _idiomaPreferido: IdiomaPreferidoVO,
    private _fechaRegistro: Date = new Date()
  ) {
    this.validateNombre(this.nombre);
  }

  get id(): string {
    return this._id;
  }
  get nombre(): string {
    return this._nombre;
  }
  get email(): Email {
    return this._email;
  }
  get phone(): Phone {
    return this._phone;
  }
  get contrasenaHash(): string {
    return this._contrasenaHash;
  }
  get idiomaPreferido(): IdiomaPreferidoVO {
    return this._idiomaPreferido;
  }
  get fechaRegistro(): Date {
    return this._fechaRegistro;
  }
  get progresos(): ProgresoUsuario[] {
    return [...this._progresos];
  }
  get notificaciones(): Notificacion[] {
    return [...this._notificaciones];
  }

  cambiarNombre(nuevoNombre: string): void {
    this.validateNombre(nuevoNombre);
    this._nombre = nuevoNombre;
  }

  cambiarEmail(nuevoEmail: Email): void {
    this._email = nuevoEmail;
  }

  cambiarIdioma(nuevoIdioma: IdiomaPreferidoVO): void {
    this._idiomaPreferido = nuevoIdioma;
  }

  async cambiarContrasena(nuevaContrasena: string): Promise<void> {
    this.validateContrasena(nuevaContrasena);
    this._contrasenaHash = await bcrypt.hash(
      nuevaContrasena,
      Number(process.env.SECRET_JUMP)
    );
  }

  async verificarContrasena(contrasena: string): Promise<boolean> {
    return await bcrypt.compare(contrasena, this._contrasenaHash);
  }

  agregarProgreso(progreso: ProgresoUsuario): void {
    if (progreso.usuarioId !== this._id) {
      throw new Error("El progreso no pertenece a este usuario");
    }
    const existente = this._progresos.find(
      (p) => p.leccionId === progreso.leccionId
    );
    if (existente) {
      existente.actualizarProgreso(progreso.porcentajeAvance);
    } else {
      this._progresos.push(progreso);
    }
  }

  agregarNotificacion(notificacion: Notificacion): void {
    if (notificacion.usuarioId !== this._id) {
      throw new Error("La notificación no pertenece a este usuario");
    }
    this._notificaciones.push(notificacion);
  }

  getNotificacionesNoLeidas(): Notificacion[] {
    return this._notificaciones.filter((n) => !n.leido);
  }

  marcarNotificacionComoLeida(notificacionId: string): void {
    const notificacion = this._notificaciones.find(
      (n) => n.id === notificacionId
    );
    if (!notificacion) {
      throw new Error("Notificación no encontrada");
    }
    notificacion.marcarComoLeido();
  }

  private validateNombre(nombre: string): void {
    if (!nombre || nombre.trim().length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }
  }

  private validateContrasena(contrasena: string): void {
    if (!contrasena || contrasena.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }
  }
}
