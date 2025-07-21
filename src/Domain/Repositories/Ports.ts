import { Usuario } from "../Aggregates/Usuario";
import { Comentario } from "../Entities/Comentario";
import { DomainEvent } from "../Events/DomainEvents";
import { Email } from "../ValueObjects/Email";

export interface UsuarioRepository {
  save(usuario: Usuario): Promise<void>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: Email): Promise<Usuario | null>;
  findByFirebaseUid(firebaseUid: string): Promise<Usuario | null>;
  findByTokenRecuperacion(token: string): Promise<Usuario | null>;
  delete(id: string): Promise<void>;
  createComment(comentario: Comentario): Promise<void>;
  findComments(): Promise<Comentario[]>;
}

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
