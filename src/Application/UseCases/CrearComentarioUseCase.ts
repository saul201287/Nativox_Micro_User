import { Comentario } from "../../Domain/Entities/Comentario";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";
import crypto from "crypto";

export class CrearComentarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(dto: { usuarioId: string; texto: string }): Promise<void> {
    const comentario = new Comentario(
      crypto.randomUUID(),
      dto.usuarioId,
      dto.texto,
      new Date()
    );
    await this.usuarioRepository.createComment(comentario);
  }
}
