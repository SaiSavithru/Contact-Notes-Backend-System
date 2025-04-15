// Manage the event-based processing for note creation using Kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({ clientId: 'notes-service', brokers: [process.env.KAFKA_BROKER] });
const producer = kafka.producer();

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "RateLimitError";
    this.status = 429;
  }
}

const produceNoteEvent = async (note) => {
  try {
    await producer.connect();
    await producer.send({ topic: 'notes-events', 
      messages: [{ key: `${note.id}`, value: JSON.stringify(note),},],
    });
    await producer.disconnect();

    console.log("Kafka message sent successfully");
  } catch (err) {
    console.error("Kafka produce failed:", err.message);

    throw err;
  }
};

module.exports = {
  produceNoteEvent,
  RateLimitError,
};
