// tests/unit/controller/broadcastController.test.js

jest.mock("../../../config/redis", () => ({
  redisClient: {
    publish: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock("../../../utils/queue", () => ({
  enqueueNotificationJob: jest.fn(),
}));

const { enqueueNotificationJob } = require("../../../utils/queue");
const { createBroadcast } = require("../../../controllers/broadcastController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("BROADCAST CONTROLLER - createBroadcast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if user is not an organizer", async () => {
    const req = {
      user: { id: "u1", role: "user" },
      body: { title: "Hello", text: "World" },
    };
    const res = mockRes();

    await createBroadcast(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Access denied: Organizers only",
    });
    expect(enqueueNotificationJob).not.toHaveBeenCalled();
  });

  it("should return 400 if title or text is missing", async () => {
    const req = {
      user: { id: "org1", role: "organizer" },
      body: { title: "Only title" },
    };
    const res = mockRes();

    await createBroadcast(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      msg: "Title and text are required",
    });
  });

  it("should enqueue broadcast message for organizer and return success", async () => {
    const req = {
      user: { id: "org1", role: "organizer" },
      body: { title: "Announcement", text: "Hello everyone" },
    };
    const res = mockRes();

    enqueueNotificationJob.mockResolvedValueOnce();

    const before = Date.now();
    await createBroadcast(req, res);
    const after = Date.now();

    expect(enqueueNotificationJob).toHaveBeenCalledTimes(1);
    const callArg = enqueueNotificationJob.mock.calls[0][0];

    expect(callArg.type).toBe("BROADCAST_MESSAGE");
    expect(callArg.payload.title).toBe("Announcement");
    expect(callArg.payload.text).toBe("Hello everyone");
    expect(callArg.payload.organizerId).toBe("org1");
    // `id` is a timestamp; just assert it's within the time window
    expect(callArg.payload.id).toBeGreaterThanOrEqual(before);
    expect(callArg.payload.id).toBeLessThanOrEqual(after);

    expect(res.json).toHaveBeenCalledWith({
      msg: "Broadcast message enqueued successfully",
    });
  });

  it("should handle errors from enqueueNotificationJob and return 500", async () => {
    const req = {
      user: { id: "org1", role: "organizer" },
      body: { title: "Announcement", text: "Hello everyone" },
    };
    const res = mockRes();

    enqueueNotificationJob.mockRejectedValueOnce(new Error("Queue failed"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await createBroadcast(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Server Error");

    consoleSpy.mockRestore();
  });
});
