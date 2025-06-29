import { Usuario } from "../Aggregates/Usuario";
import { Notificacion } from "../Entities/Notificacion";
import { UsuarioRepository, EventPublisher } from "../Repositories/Ports";

export enum TipoNotificacion {
  PUSH = "push",
  EMAIL = "email",
}

export interface NotificacionStrategy {
  enviar(usuario: Usuario, mensaje: string): Promise<void>;
}

export class ServicioDeNotificaciones {
  private strategies: Map<TipoNotificacion, NotificacionStrategy> = new Map();

  constructor(
    private usuarioRepository: UsuarioRepository,
    private eventPublisher: EventPublisher
  ) {}

  registrarStrategy(
    tipo: TipoNotificacion,
    strategy: NotificacionStrategy
  ): void {
    this.strategies.set(tipo, strategy);
  }

  async enviarNotificacion(
    usuarioId: string,
    mensaje: string,
    tipo: TipoNotificacion = TipoNotificacion.PUSH
  ): Promise<void> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const strategy = this.strategies.get(tipo);
    if (!strategy) {
      throw new Error(`Tipo de notificación ${tipo} no soportado`);
    }

    // Crear notificación en el dominio
    const notificacion = new Notificacion(
      crypto.randomUUID(),
      usuarioId,
      mensaje
    );

    usuario.agregarNotificacion(notificacion);
    await this.usuarioRepository.save(usuario);

    // Enviar notificación externa
    await strategy.enviar(usuario, mensaje);
  }

  async programarNotificacion(
    usuarioId: string,
    mensaje: string,
    fechaEnvio: Date,
    tipo: TipoNotificacion = TipoNotificacion.PUSH
  ): Promise<void> {
    // Implementar lógica de programación (scheduler)
    console.log(`Notificación programada para ${fechaEnvio}`);
  }
}
