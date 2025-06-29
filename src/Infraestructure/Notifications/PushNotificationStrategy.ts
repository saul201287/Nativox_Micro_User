import { Usuario } from "../../Domain/Aggregates/Usuario";
import { NotificacionStrategy } from "../../Domain/Services/ServicioDeNotificaciones";

export class PushNotificationStrategy implements NotificacionStrategy {
  async enviar(usuario: Usuario, mensaje: string): Promise<void> {
    // Implementar integración con servicio de push notifications
    console.log(
      `Enviando push notification a ${usuario.email.getValue()}: ${mensaje}`
    );
  }
}

export class EmailNotificationStrategy implements NotificacionStrategy {
  async enviar(usuario: Usuario, mensaje: string): Promise<void> {
    // Implementar integración con servicio de email
    console.log(`Enviando email a ${usuario.email.getValue()}: ${mensaje}`);
  }
}
