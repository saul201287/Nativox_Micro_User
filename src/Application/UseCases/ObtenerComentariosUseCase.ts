import { Comentario } from "../../Domain/Entities/Comentario";
import { UsuarioRepository } from "../../Domain/Repositories/Ports";

export class ObtenerComentariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async execute(): Promise<Comentario[]> {
   try {
     const comentarios = await this.usuarioRepository.findComments();
     return comentarios;
   } catch (error) {
    console.error("Error al obtener comentarios:", error);
    throw error;
   }
  }
}
