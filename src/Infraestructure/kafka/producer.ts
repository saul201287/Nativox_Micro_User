import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "usuarios",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();

export async function enviarEvento(topico: string, mensaje: any) {
  await producer.connect();
  await producer.send({
    topic: topico,
    messages: [{ value: JSON.stringify(mensaje) }],
  });
  await producer.disconnect();
}
