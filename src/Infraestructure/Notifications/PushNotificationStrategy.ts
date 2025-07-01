import { Usuario } from "../../Domain/Aggregates/Usuario";
import { NotificacionStrategy } from "../../Domain/Services/ServicioDeNotificaciones";
import nodemailer from "nodemailer";

export class PushNotificationStrategy implements NotificacionStrategy {
  async enviar(usuario: Usuario, mensaje: string): Promise<void> {
    // Implementar integración con servicio de push notifications
    console.log(
      `Enviando push notification a ${usuario.email.getValue()}: ${mensaje}`
    );
  }
}

export class EmailNotificationStrategy implements NotificacionStrategy {
  
  
  private transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: Number(process.env.PORT_EMAIL),
    secure: true,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASS_EMAIL,
    },
  });

  async enviar(usuario: Usuario, mensaje: string): Promise<void> {
    const mailOptions = {
      from: process.env.USER_EMAIL || '"Mi App" <no-reply@miapp.com>',
      to: usuario.email.getValue(),
      subject: "Notificación",
      text: mensaje,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${usuario.email.getValue()}: ${mensaje}`);
    } catch (error) {
      console.error("Error enviando email:", error);
    }
  }
}
