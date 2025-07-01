import { Request, Response } from "express";
import { ActualizarProgresoUseCase } from "../../../Application/UseCases/ActualizarProgresoUseCase";
import { LoginUseCase } from "../../../Application/UseCases/LoginUseCase";
import { RegistrarUsuarioUseCase } from "../../../Application/UseCases/RegistrarUsuarioUseCase";

export class UsuarioController {
  constructor(
    private registrarUsuarioUseCase: RegistrarUsuarioUseCase,
    private loginUseCase: LoginUseCase,
    private actualizarProgresoUseCase: ActualizarProgresoUseCase
  ) {}

  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, phone, contrasena, idiomaPreferido } = req.body;
      const result = await this.registrarUsuarioUseCase.execute({
        nombre,
        email,
        phone,
        contrasena,
        idiomaPreferido,
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
      console.log(result);
      
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
}
