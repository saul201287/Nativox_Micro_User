export class ProgresoUsuario {
  constructor(
    private _id: string,
    private _usuarioId: string,
    private _leccionId: string,
    private _porcentajeAvance: number,
    private _fechaUltimaActividad: Date = new Date()
  ) {
    this.validatePorcentaje(this.porcentajeAvance);
  }

  get id(): string {
    return this._id;
  }
  get usuarioId(): string {
    return this._usuarioId;
  }
  get leccionId(): string {
    return this._leccionId;
  }
  get porcentajeAvance(): number {
    return this._porcentajeAvance;
  }
  get fechaUltimaActividad(): Date {
    return this._fechaUltimaActividad;
  }

  actualizarProgreso(nuevoPorcentaje: number): void {
    this.validatePorcentaje(nuevoPorcentaje);
    if (nuevoPorcentaje > this._porcentajeAvance) {
      this._porcentajeAvance = nuevoPorcentaje;
      this._fechaUltimaActividad = new Date();
    }
  }

  private validatePorcentaje(porcentaje: number): void {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new Error("El porcentaje debe estar entre 0 y 100");
    }
  }
}
