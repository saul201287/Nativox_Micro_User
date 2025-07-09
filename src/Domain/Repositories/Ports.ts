import { Usuario } from "../Aggregates/Usuario";
import { DomainEvent } from "../Events/DomainEvents";
import { Email } from "../ValueObjects/Email";

export interface UsuarioRepository {
  save(usuario: Usuario): Promise<void>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: Email): Promise<Usuario | null>;
  findByTokenRecuperacion(token: string): Promise<Usuario | null>;
  delete(id: string): Promise<void>;
}

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
