const { startSubscriber } = require('../../../services/notificationService');
const { subscriberClient } = require('../../../config/redis');

// 1. Mock the Redis Config
jest.mock('../../../config/redis', () => ({
  subscriberClient: {
    connect: jest.fn().mockResolvedValue(),
    subscribe: jest.fn().mockResolvedValue(),
  },
}));

describe('Notification Service - Unit Test', () => {
  let mockWss;

  beforeEach(() => {
    // 2. Mock WebSocket Server with a Set of "clients"
    mockWss = {
      clients: new Set([
        { readyState: 1, send: jest.fn() }, // Active client
        { readyState: 0, send: jest.fn() }, // Connecting client (should be ignored)
      ]),
    };
    jest.clearAllMocks();
  });

  test('should connect and subscribe to Redis channels', async () => {
    await startSubscriber(mockWss);

    expect(subscriberClient.connect).toHaveBeenCalled();
    expect(subscriberClient.subscribe).toHaveBeenCalledWith(
      ['event-updates', 'notifications'],
      expect.any(Function)
    );
  });

  test('should broadcast messages only to OPEN websocket clients', async () => {
    await startSubscriber(mockWss);

    // Capture the listener function passed to Redis
    const listener = subscriberClient.subscribe.mock.calls[0][1];
    
    // Simulate a message coming from Redis
    const testMessage = JSON.stringify({ text: 'Hello World' });
    listener(testMessage, 'notifications');

    const clientsArray = Array.from(mockWss.clients);
    
    // The first client (readyState 1) should have received the message
    expect(clientsArray[0].send).toHaveBeenCalledWith(testMessage);
    // The second client (readyState 0) should NOT have received it
    expect(clientsArray[1].send).not.toHaveBeenCalled();
  });
});