import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { Signale } from 'signale';
import { database } from '../../Config/db/connect';
import { TypeORMUsuarioRepository } from '../Adapters/TypeORM/UserRepository';

const signale = new Signale();

if (!process.env.CLIENT_ID || !process.env.BROKER) {
  throw new Error("Credenciales de Kafka nulas");
}

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.BROKER],
});

const consumer = kafka.consumer({ groupId: 'usuario-saga-group' });

export async function startSagaConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-domain-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const eventType = message.headers?.eventType?.toString();
      const eventData = JSON.parse(message.value?.toString() || '{}');

      if (eventType === 'NotificacionFallida') {
        signale.warn('Notificación fallida, iniciando compensación SAGA...');
        const usuarioRepository = new TypeORMUsuarioRepository(database.getDataSource());
        await usuarioRepository.delete(eventData.usuarioId);
        signale.warn(`Usuario ${eventData.usuarioId} eliminado por SAGA de compensación`);
      }
    },
  });
}

export class KafkaConsumer {
  private consumer: Consumer;

  constructor(
    private kafka: Kafka,
    private groupId: string,
    private topics: string[]
  ) {
    this.consumer = kafka.consumer({ groupId });
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: this.topics });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      }
    });
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    const eventType = message.headers?.eventType?.toString();

    console.log(`Received message: ${topic} - ${eventType}`);
    
    try {
      const eventData = JSON.parse(message.value?.toString() || '{}');
      
      switch (eventType) {
        case 'LeccionCompletada':
          await this.handleLeccionCompletada(eventData);
          break;
        case 'CursoIniciado':
          await this.handleCursoIniciado(eventData);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private async handleLeccionCompletada(eventData: any): Promise<void> {
    // Lógica para manejar cuando se completa una lección
    console.log('Handling LeccionCompletada event:', eventData);
  }

  private async handleCursoIniciado(eventData: any): Promise<void> {
    // Lógica para manejar cuando se inicia un curso
    console.log('Handling CursoIniciado event:', eventData);
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}