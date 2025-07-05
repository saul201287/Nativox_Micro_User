import { Kafka } from "kafkajs";

if (!process.env.CLIENT_ID || !process.env.BROKER) {
  throw new Error("Credenciales de Kafka nulas");
}

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.BROKER],
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
