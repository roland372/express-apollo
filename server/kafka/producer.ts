import { Kafka } from 'kafkajs';

const kafka = new Kafka({
	clientId: 'my-app',
	brokers: ['localhost:9092'],
});

export const send = async (topic: string, message) => {
	const stringify = JSON.stringify(message);
	const producer = kafka.producer();
	await producer.connect();
	await producer.send({
		topic: topic,
		messages: [{ key: 'key1', value: stringify }],
	});

	await producer.disconnect();
};
