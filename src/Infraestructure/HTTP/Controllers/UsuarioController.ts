import { Request, Response } from "express";
import { ActualizarProgresoUseCase } from "../../../Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "../../../Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "../../../Application/UseCases/RegistrarUsuarioUseCase";
import { SolicitarRecuperacionContrasenaUseCase } from "../../../Application/UseCases/SolicitarRecuperacionContrasenaUseCase";
import { RestablecerContrasenaUseCase } from "../../../Application/UseCases/RestablecerContrasenaUseCase";
import { ActualizarFcmTokenUseCase } from "../../../Application/UseCases/ActualizarFcmTokenUseCase";
import { CrearComentarioUseCase } from "../../../Application/UseCases/CrearComentarioUseCase";
import { ObtenerComentariosUseCase } from "../../../Application/UseCases/ObtenerComentariosUseCase";

export class UsuarioController {
  constructor(
    private readonly registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly actualizarProgresoUseCase: ActualizarProgresoUseCase,
    private readonly solicitarRecuperacionContrasenaUseCase: SolicitarRecuperacionContrasenaUseCase,
    private readonly restablecerContrasenaUseCase: RestablecerContrasenaUseCase,
    private readonly actualizarFcmTokenUseCase: ActualizarFcmTokenUseCase,
    private readonly crearComentarioUseCase: CrearComentarioUseCase,
    private readonly obtenerComentariosUseCase: ObtenerComentariosUseCase
  ) {}

  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellido, email, phone, contrasena, idiomaPreferido, fcmToken } = req.body;
      const result = await this.registrarUsuarioUseCase.execute({
        nombre,
        apellido,
        email,
        phone,
        contrasena,
        idiomaPreferido,
        fcmToken
      });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, contrasena } = req.body;
      const result = await this.loginUseCase.execute({ email, contrasena });
      
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error });
    }
  }

  async actualizarProgreso(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const { leccionId, porcentajeAvance } = req.body;

      await this.actualizarProgresoUseCase.execute({
        usuarioId,
        leccionId,
        porcentajeAvance,
      });

      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async solicitarRecuperacionContrasena(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await this.solicitarRecuperacionContrasenaUseCase.execute({ email });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async restablecerContrasena(req: Request, res: Response): Promise<void> {
    try {
      const { token, nuevaContrasena } = req.body;
      const result = await this.restablecerContrasenaUseCase.execute({ token, nuevaContrasena });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async actualizarFcmToken(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const { fcmToken } = req.body;
      
      const result = await this.actualizarFcmTokenUseCase.execute({ 
        usuarioId, 
        fcmToken 
      });
      
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error });
    }
  }

  async crearComentario(req: Request, res: Response) {
    try {
      const { usuarioId, texto } = req.body;
      await this.crearComentarioUseCase.execute({ usuarioId, texto });
      res.status(201).json({ success: true, message: "Comentario creado" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al crear comentario" });
    }
  }

  async obtenerComentarios(req: Request, res: Response) {
    try {
      const comentarios = await this.obtenerComentariosUseCase.execute();
      res.status(200).json({ success: true, comentarios });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error al obtener comentarios" });
    }
  }
}
