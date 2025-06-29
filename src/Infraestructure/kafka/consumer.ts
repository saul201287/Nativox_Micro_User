import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

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