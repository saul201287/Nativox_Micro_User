import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ProgresoUsuarioEntity } from "./ProgresoUsuario.entity";
import { NotificacionEntity } from "./Notificacion.Entity";
import { ComentarioEntity } from "./Comentarios.Entie";

@Entity("usuarios")
export class UsuarioEntity {
  @PrimaryColumn("uuid")
  id?: string;

  @Column()
  nombre?: string;

  @Column()
  apellido?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, type: "varchar", length: 10 })
  phone!: string;

  @Column({ nullable: true })
  contrasena_hash?: string;

  @Column({ type: "varchar", length: 15 })
  idioma_preferido!: string;

  @CreateDateColumn()
  fecha_registro!: Date;

  @UpdateDateColumn()
  fecha_actualizacion!: Date;

  @Column({ nullable: true })
  fcmToken?: string;

  @Column({ nullable: true })
  token_recuperacion?: string;

  @Column({ nullable: true })
  fecha_expiracion_token?: Date;

  @Column({ nullable: true, unique: true })
  firebase_uid?: string;

  @Column({ nullable: true })
  firebase_display_name?: string;

  @Column({ nullable: true })
  firebase_phone_number?: string;

  @Column({ default: false })
  email_verificado?: boolean;

  @Column({ nullable: true })
  ultimo_login?: Date;

  @Column({ default: "local" })
  tipo_autenticacion?: string; 

  @OneToMany(() => ProgresoUsuarioEntity, (progreso) => progreso.usuario)
  progresos!: ProgresoUsuarioEntity[];

  @OneToMany(() => ComentarioEntity, (comentario) => comentario.usuario)
  comentarios!: ComentarioEntity[];

  @OneToMany(() => NotificacionEntity, (notificacion) => notificacion.usuario)
  notificaciones!: NotificacionEntity[];
}



