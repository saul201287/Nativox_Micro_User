import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("usuarios")
export class UsuarioEntity {
  @PrimaryColumn("uuid")
  id?: string;

  @Column()
  nombre?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, type: "varchar", length: 10 })
  phone!: string;

  @Column()
  contrasena_hash!: string;

  @Column({ type: "varchar", length: 15 })
  idioma_preferido!: string;

  @CreateDateColumn()
  fecha_registro!: Date;

  @OneToMany(() => ProgresoUsuarioEntity, (progreso) => progreso.usuario)
  progresos!: ProgresoUsuarioEntity[];

  @OneToMany(() => NotificacionEntity, (notificacion) => notificacion.usuario)
  notificaciones!: NotificacionEntity[];
}

@Entity("progreso_usuario")
export class ProgresoUsuarioEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column("uuid")
  usuario_id!: string;

  @Column()
  leccion_id!: string;

  @Column("int")
  porcentaje_avance!: number;

  @CreateDateColumn()
  fecha_ultima_actividad!: Date;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.progresos)
  @JoinColumn({ name: "usuario_id" })
  usuario!: UsuarioEntity;
}

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
