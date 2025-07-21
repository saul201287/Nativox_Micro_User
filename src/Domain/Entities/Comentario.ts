export class Comentario{
    constructor(
        private _id: string,
        private _usuarioId: string,
        private _mensaje: string,
        private _fechaEnvio: Date = new Date(),
    ) {}

    get id(): string {
        return this._id;
    }

    get usuarioId(): string {
        return this._usuarioId;
    }

    get mensaje(): string {
        return this._mensaje;
    }

    get fechaEnvio(): Date {
        return this._fechaEnvio;
    }
}