import { EachMessagePayload } from "kafkajs";
import { KafkaClient } from "../../../Shared/infrastructure/kafka/KafkaClient";
import { INotificacionRepository } from "../../../Domain/Repositories/INotificacionRepository";
import { Notificacion } from "../../../Domain/Entities/Notificacion";

export class NotificacionConsumer {
  private static readonly TOPIC = "notificacion.enviada";

  constructor(
    private readonly kafkaClient: KafkaClient,
    private readonly notificacionRepository: INotificacionRepository
  ) {}

  async start(): Promise<void> {
    await this.kafkaClient.connectConsumer();
    await this.kafkaClient.subscribe(NotificacionConsumer.TOPIC);
    await this.kafkaClient.runConsumer(this.handleMessage.bind(this));
    console.log(
      `Listening for messages on topic: ${NotificacionConsumer.TOPIC}`
    );
  }

  async stop(): Promise<void> {
    await this.kafkaClient.disconnectConsumer();
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const message = JSON.parse(payload.message.value?.toString() || "{}");

      const {
        eventName,
        payload: notificationPayload,
        aggregateId: userId,
      } = message;

      if (eventName !== "notificacion.enviada") {
        console.warn("[SAGA] Evento no manejado:", eventName);
        return;
      }

      const {
        titulo,
        mensaje,
        tipo = "notificacion",
        metadata = {},
      } = notificationPayload || {};

      if (!userId || !mensaje) {
        console.warn("[SAGA] Mensaje de notificación inválido:", message);
        return;
      }

      try {
        const notificacion = new Notificacion(
          `${Date.now()}-${userId}`,
          userId,
          titulo
            ? `[${tipo?.toUpperCase() || "NOTIF"}] ${titulo}: ${mensaje}`
            : mensaje,
          false,
          new Date()
        );

        await this.notificacionRepository.save(notificacion);
        console.log(`[SAGA] Notificación guardada para el usuario ${userId}`);
      } catch (dbError) {
        console.error(
          "[SAGA] Error al guardar la notificación en la base de datos:",
          dbError
        );
        throw dbError;
      }
    } catch (error) {
      console.error("[SAGA] Error procesando mensaje de notificación:", error);
      throw error;
    }
  }
}
