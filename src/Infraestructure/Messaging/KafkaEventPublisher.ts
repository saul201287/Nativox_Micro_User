import { Kafka, Producer } from "kafkajs";
import { DomainEvent } from "../../Domain/Events/DomainEvents";
import { EventPublisher } from "../../Domain/Repositories/Ports";

export class KafkaEventPublisher implements EventPublisher {
  private producer: Producer;

  constructor(private kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: "user-domain-events",
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            eventVersion: event.eventVersion.toString(),
          },
        },
      ],
    });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
