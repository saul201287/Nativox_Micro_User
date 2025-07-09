import { Repository, DataSource } from "typeorm";
import { Usuario } from "../../../Domain/Aggregates/Usuario";
import { Notificacion } from "../../../Domain/Entities/Notificacion";
import { ProgresoUsuario } from "../../../Domain/Entities/ProgresoUsuario";
import { UsuarioRepository } from "../../../Domain/Repositories/Ports";
import { Email } from "../../../Domain/ValueObjects/Email";
import { IdiomaPreferidoVO, IdiomaPreferido } from "../../../Domain/ValueObjects/IdiomaPreferido";
import { UsuarioEntity } from "../../../Config/db/entities/User.Entity";
import { ProgresoUsuarioEntity } from "../../../Config/db/entities/ProgresoUsuario.entity";
import { NotificacionEntity } from "../../../Config/db/entities/Notificacion.Entity";
import { Phone } from "../../../Domain/ValueObjects/Phone";

export class TypeORMUsuarioRepository implements UsuarioRepository {
  private readonly usuarioRepo: Repository<UsuarioEntity>;
  private readonly progresoRepo: Repository<ProgresoUsuarioEntity>;
  private readonly notificacionRepo: Repository<NotificacionEntity>;

  constructor(dataSource: DataSource) {
    this.usuarioRepo = dataSource.getRepository(UsuarioEntity);
    this.progresoRepo = dataSource.getRepository(ProgresoUsuarioEntity);
    this.notificacionRepo = dataSource.getRepository(NotificacionEntity);
  }

  async save(usuario: Usuario): Promise<void> {
    const usuarioEntity = new UsuarioEntity();
    usuarioEntity.id = usuario.id;
    usuarioEntity.nombre = usuario.nombre;
    usuarioEntity.apellido = usuario.apellido;
    usuarioEntity.email = usuario.email.getValue();
    usuarioEntity.phone = usuario.phone.Number
    usuarioEntity.contrasena_hash = usuario.contrasenaHash;
    usuarioEntity.idioma_preferido = usuario.idiomaPreferido.getValue();
    usuarioEntity.fecha_registro = usuario.fechaRegistro;
    usuarioEntity.fcmToken = usuario.fcmToken;
    usuarioEntity.token_recuperacion = usuario.tokenRecuperacion;
    usuarioEntity.fecha_expiracion_token = usuario.fechaExpiracionToken;

    await this.usuarioRepo.save(usuarioEntity);

    for (const progreso of usuario.progresos) {
      const progresoEntity = new ProgresoUsuarioEntity();
      progresoEntity.id = progreso.id;
      progresoEntity.usuario_id = progreso.usuarioId;
      progresoEntity.leccion_id = progreso.leccionId;
      progresoEntity.porcentaje_avance = progreso.porcentajeAvance;
      progresoEntity.fecha_ultima_actividad = progreso.fechaUltimaActividad;

      await this.progresoRepo.save(progresoEntity);
    }

    for (const notificacion of usuario.notificaciones) {
      const notifEntity = new NotificacionEntity();
      notifEntity.id = notificacion.id;
      notifEntity.usuario_id = notificacion.usuarioId;
      notifEntity.mensaje = notificacion.mensaje;
      notifEntity.leido = notificacion.leido;
      notifEntity.fecha_envio = notificacion.fechaEnvio;

      await this.notificacionRepo.save(notifEntity);
    }
  }

  async findById(id: string): Promise<Usuario | null> {
    const usuarioEntity = await this.usuarioRepo.findOne({
      where: { id },
      relations: ["progresos", "notificaciones"],
    });

    if (!usuarioEntity) return null;

    return this.toDomain(usuarioEntity);
  }

  async findByEmail(email: Email): Promise<Usuario | null> {
   try {
    const usuarioEntity = await this.usuarioRepo.findOne({
      where: { email: email.getValue() },
      relations: ["progresos", "notificaciones"],
    });
    
    if (!usuarioEntity) return null;

    return this.toDomain(usuarioEntity);
   } catch (error) {
    throw new Error("Credenciales inválidas: " + error);
   }
  }

  async findByTokenRecuperacion(token: string): Promise<Usuario | null> {
    try {
      const usuarioEntity = await this.usuarioRepo.findOne({
        where: { token_recuperacion: token },
        relations: ["progresos", "notificaciones"],
      });
      
      if (!usuarioEntity) return null;

      return this.toDomain(usuarioEntity);
    } catch (error) {
      throw new Error("Error al buscar usuario por token: " + error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.usuarioRepo.delete(id);
  }

  private toDomain(entity: UsuarioEntity): Usuario {
    const email = new Email(entity.email);
    const phone = new Phone(entity.phone, true)
    const idiomaPreferido = new IdiomaPreferidoVO(
      entity.idioma_preferido as IdiomaPreferido
    );

    const usuario = new Usuario(
      entity.id!,
      entity.nombre!,
      entity.apellido!,
      email,
      phone,
      entity.contrasena_hash,
      idiomaPreferido,
      entity.fecha_registro
    );

    if (entity.fcmToken) {
      usuario.establecerFcmToken(entity.fcmToken);
    }

    if (entity.token_recuperacion && entity.fecha_expiracion_token) {
      usuario.agregarTokenRecuperacion(entity.token_recuperacion, entity.fecha_expiracion_token);
    }

    if (entity.progresos) {
      for (const progresoEntity of entity.progresos) {
        const progreso = new ProgresoUsuario(
          progresoEntity.id,
          progresoEntity.usuario_id,
          progresoEntity.leccion_id,
          progresoEntity.porcentaje_avance,
          progresoEntity.fecha_ultima_actividad
        );
        usuario.agregarProgreso(progreso);
      }
    }

    if (entity.notificaciones) {
      for (const notifEntity of entity.notificaciones) {
        const notificacion = new Notificacion(
          notifEntity.id,
          notifEntity.usuario_id,
          notifEntity.mensaje,
          notifEntity.leido,
          notifEntity.fecha_envio
        );
        usuario.agregarNotificacion(notificacion);
      }
    }

    return usuario;
  }
}
