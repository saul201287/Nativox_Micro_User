import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UsuarioEntity } from "./User.Entity";

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
