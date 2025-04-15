const connect = jest.fn();
const disconnect = jest.fn();
const send = jest.fn();

const producer = () => ({
  connect,
  send,
  disconnect,
});

const Kafka = jest.fn().mockImplementation(() => ({
  producer,
}));

module.exports = {
  Kafka,
  __mockProducer: {
    connect,
    send,
    disconnect,
  },
};
