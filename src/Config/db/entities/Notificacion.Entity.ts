import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UsuarioEntity } from "./User.Entity";

@Entity("notificaciones")
export class NotificacionEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  usuario_id!: string;

  @Column("text")
  mensaje!: string;

  @Column({ type: "boolean", default: false })
  leido!: boolean;

  @CreateDateColumn()
  fecha_envio!: Date;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.notificaciones)
  @JoinColumn({ name: "usuario_id" })
  usuario!: UsuarioEntity;
}
