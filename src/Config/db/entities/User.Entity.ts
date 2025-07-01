import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
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



