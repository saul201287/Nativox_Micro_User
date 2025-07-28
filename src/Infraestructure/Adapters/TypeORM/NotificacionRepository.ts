import { Repository, DataSource } from "typeorm";
import { Notificacion } from "../../../Domain/Entities/Notificacion";
import { INotificacionRepository } from "../../../Domain/Repositories/INotificacionRepository";
import { NotificacionEntity } from "../../../Config/db/entities/Notificacion.Entity";

export class TypeORMNotificacionRepository implements INotificacionRepository {
  private readonly notificacionRepo: Repository<NotificacionEntity>;

  constructor(dataSource: DataSource) {
    this.notificacionRepo = dataSource.getRepository(NotificacionEntity);
  }

  async getNotificacionesByUsuarioId(usuarioId: string): Promise<Notificacion[]> {
    const notificacionesEntity = await this.notificacionRepo.find({
      where: { usuario_id: usuarioId },
      order: { fecha_envio: 'DESC' },
    });

    return notificacionesEntity.map(entity => this.toDomain(entity));
  }

  async save(notificacion: Notificacion): Promise<void> {
    const notificacionEntity = this.toEntity(notificacion);
    await this.notificacionRepo.save(notificacionEntity);
  }

  async update(notificacion: Notificacion): Promise<void> {
    const notificacionEntity = this.toEntity(notificacion);
    await this.notificacionRepo.save(notificacionEntity);
  }

  async findById(id: string): Promise<Notificacion | null> {
    const notificacionEntity = await this.notificacionRepo.findOne({ 
      where: { id } 
    });
    
    return notificacionEntity ? this.toDomain(notificacionEntity) : null;
  }

  private toDomain(entity: NotificacionEntity): Notificacion {
    const notificacion = new Notificacion(
      entity.id,
      entity.usuario_id,
      entity.mensaje,
      entity.leido,
      entity.fecha_envio
    );

    return notificacion;
  }

  private toEntity(notificacion: Notificacion): NotificacionEntity {
    const entity = new NotificacionEntity();
    entity.id = notificacion.id;
    entity.usuario_id = notificacion.usuarioId;
    entity.mensaje = notificacion.mensaje;
    entity.leido = notificacion.leido;
    entity.fecha_envio = notificacion.fechaEnvio;
    
    return entity;
  }
}
