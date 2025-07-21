import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { UsuarioEntity } from "./User.Entity";

@Entity("comentarios")
export class ComentarioEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  usuario_id!: string;

  @Column("text")
  mensaje!: string;

  @CreateDateColumn()
  fecha_envio!: Date;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.notificaciones)
  @JoinColumn({ name: "usuario_id" })
  usuario!: UsuarioEntity;
}
