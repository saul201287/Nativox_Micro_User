export class Notificacion {
  constructor(
    private _id: string,
    private _usuarioId: string,
    private _mensaje: string,
    private _leido: boolean = false,
    private _fechaEnvio: Date = new Date()
  ) {
    this.validateMensaje(this.mensaje);
  }

  get id(): string {
    return this._id;
  }
  get usuarioId(): string {
    return this._usuarioId;
  }
  get mensaje(): string {
    return this._mensaje;
  }
  get leido(): boolean {
    return this._leido;
  }
  get fechaEnvio(): Date {
    return this._fechaEnvio;
  }

  marcarComoLeido(): void {
    this._leido = true;
  }

  private validateMensaje(mensaje: string): void {
    if (!mensaje || mensaje.trim().length === 0) {
      throw new Error("El mensaje no puede estar vacío");
    }
  }
}
