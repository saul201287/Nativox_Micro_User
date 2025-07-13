import { ProgresoUsuario } from "../../Domain/Entities/ProgresoUsuario";
import { ProgresoActualizadoEvent } from "../../Domain/Events/DomainEvents";
import { UsuarioRepository, EventPublisher } from "../../Domain/Repositories/Ports";
import { ActualizarProgresoDTO } from "../DTOs/DTOs";
import crypto from "crypto";

export class ActualizarProgresoUseCase {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(dto: ActualizarProgresoDTO): Promise<void> {
    const usuario = await this.usuarioRepository.findById(dto.usuarioId);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const progreso = new ProgresoUsuario(
      crypto.randomUUID(),
      dto.usuarioId,
      dto.leccionId,
      dto.porcentajeAvance
    );

    usuario.agregarProgreso(progreso);
    await this.usuarioRepository.save(usuario);

    // Publicar evento
    const event = new ProgresoActualizadoEvent(
      dto.usuarioId,
      dto.leccionId,
      dto.porcentajeAvance
    );
    await this.eventPublisher.publish(event);
  }
}
