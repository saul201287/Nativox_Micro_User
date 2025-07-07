import { Usuario } from "../../Domain/Aggregates/Usuario";
import { NotificacionStrategy } from "../../Domain/Services/ServicioDeNotificaciones";
import nodemailer from "nodemailer";

export class PushNotificationStrategy implements NotificacionStrategy {
  async enviar(usuario: Usuario, mensaje: string): Promise<void> {
    // TODO:Implementar Firebase
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

  async enviar(usuario: any, mensaje: string): Promise<void> {
    console.log(usuario.email.getValue());
    
    const mailOptions = {
      from: process.env.USER_EMAIL || '"Mi App" <no-reply@miapp.com>',
      to: usuario.email.getValue(),
      subject: "¡Bienvenido a Mi App!",
      text: mensaje,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <img src=${
            process.env.IMG_LOGO
          } alt="Logo Mi App" style="max-width: 150px; margin-bottom: 20px;">
          <h2>¡Hola, ${usuario.nombre}!</h2>
          <p>${mensaje}</p>
          <hr>
          <small>Este es un mensaje automático de Mi App. Fecha: ${new Date().toLocaleString()}</small>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${usuario.email.getValue()}: ${mensaje}`);
    } catch (error) {
      console.error("Error enviando email:", error);
    }
  }
}
