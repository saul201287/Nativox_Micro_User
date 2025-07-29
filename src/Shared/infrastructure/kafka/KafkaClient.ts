import { Kafka, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';

export class KafkaClient {
  private readonly kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;

  constructor(brokers: string[], clientId: string, groupId: string) {
    this.kafka = new Kafka({
      clientId: clientId,
      brokers: brokers,
      retry: {
        initialRetryTime: 300,
        retries: 8
      }
    });

    this.consumer = this.kafka.consumer({ 
      groupId: groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 10000,
    });
  }

  async connectConsumer(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log('Kafka consumer connected successfully');
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      throw error;
    }
  }

  async disconnectConsumer(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Kafka consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error);
      throw error;
    }
  }

  async subscribe(topic: string): Promise<void> {
    await this.consumer.subscribe({ 
      topic: topic,
      fromBeginning: true 
    });
  }

  async runConsumer(onMessage: (payload: EachMessagePayload) => Promise<void>): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await onMessage(payload);
        } catch (error) {
          console.error('Error processing message:', error);
          
          throw error;
        }
      },
    });
  }
}
