import { Comentario } from "../../Domain/Entities/Comentario";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";

export class ObtenerComentariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(): Promise<Comentario[]> {
    return this.usuarioRepository.findComments();
  }
}
