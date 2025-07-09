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

  @Column()
  contrasena_hash!: string;

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

  @OneToMany(() => ProgresoUsuarioEntity, (progreso) => progreso.usuario)
  progresos!: ProgresoUsuarioEntity[];

  @OneToMany(() => NotificacionEntity, (notificacion) => notificacion.usuario)
  notificaciones!: NotificacionEntity[];
}



