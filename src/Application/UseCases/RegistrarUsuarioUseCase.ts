import { Usuario } from "../../Domain/Aggregates/Usuario";
import { UsuarioRegistradoEvent } from "../../Domain/Events/DomainEvents";
import { UsuarioRepository, EventPublisher } from "../../Domain/Repositories/Ports";
import { Email } from "../../Domain/ValueObjects/Email";
import { IdiomaPreferidoVO } from "../../Domain/ValueObjects/IdiomaPreferido";
import { Phone } from "../../Domain/ValueObjects/Phone";
import { RegistrarUsuarioDTO } from "../DTOs/DTOs";
import * as bcrypt from "bcrypt";

export class RegistrarUsuarioUseCase {
  constructor(
    private usuarioRepository: UsuarioRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(dto: RegistrarUsuarioDTO): Promise<{ id: string }> {
    const email = new Email(dto.email);
    const phone = new Phone(dto.phone, true)

    // Verificar unicidad del email
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new Error("El email ya está registrado");
    }

    // Crear usuario
    const usuarioId = crypto.randomUUID();
    const idiomaPreferido = new IdiomaPreferidoVO(dto.idiomaPreferido);
    const contrasenaHash = await bcrypt.hash(dto.contrasena, 10);

    const usuario = new Usuario(
      usuarioId,
      dto.nombre,
      email,
      phone,
      contrasenaHash,
      idiomaPreferido
    );

    await this.usuarioRepository.save(usuario);

    // Publicar evento
    const event = new UsuarioRegistradoEvent(
      usuario.id,
      usuario.email.getValue(),
      usuario.nombre
    );
    await this.eventPublisher.publish(event);

    return { id: usuario.id };
  }
}
