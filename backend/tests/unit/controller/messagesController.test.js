// tests/unit/controller/messagesController.test.js

jest.mock("../../../utils/queue", () => ({
  enqueueNotificationJob: jest.fn(),
}));

jest.mock("../../../config/redis", () => ({
  redisClient: {
    publish: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock("../../../models/Conversation", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../../models/Message", () => ({
  create: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock("../../../models/Event", () => ({
  findById: jest.fn(),
}));

jest.mock("../../../models/User", () => ({
  findById: jest.fn(),
}));

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

const messagesController = require("../../../controllers/messagesController");
const Conversation = require("../../../models/Conversation");
const Message = require("../../../models/Message");
const Event = require("../../../models/Event");
const User = require("../../../models/User");
const { enqueueNotificationJob } = require("../../../utils/queue");

const app = express();
app.use(bodyParser.json());

// auth stub
app.use((req, res, next) => {
  if (req.headers.user) {
    req.user = JSON.parse(req.headers.user);
  }
  next();
});

app.post(
  "/api/messages/events/:eventId/to/:attendeeId",
  messagesController.sendMessageToAttendee
);
app.post(
  "/api/messages/events/:eventId/broadcast-inbox",
  messagesController.broadcastMessageToAttendees
);
app.get("/api/messages/inbox", messagesController.getInbox);
app.get(
  "/api/messages/conversations/:conversationId",
  messagesController.getConversationMessages
);

const organizer = { id: "org1", role: "organizer", name: "Org" };
const attendee = { id: "att1", role: "user", name: "User" };

describe("Messages Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessageToAttendee", () => {
    it("returns 400 when text is missing", async () => {
      const res = await request(app)
        .post("/api/messages/events/e1/to/att1")
        .set("user", JSON.stringify(organizer))
        .send({});

      expect(res.status).toBe(400);
    });

    it("returns 404 when event does not exist", async () => {
      Event.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .post("/api/messages/events/e1/to/att1")
        .set("user", JSON.stringify(organizer))
        .send({ text: "Hi" });

      expect(res.status).toBe(404);
    });

    it("sends message successfully", async () => {
      Event.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "e1",
          organizer: { name: "Org" },
          attendees: [{ user: "att1" }],
        }),
      });

      User.findById.mockResolvedValue({ _id: "att1" });
      Conversation.findOne.mockResolvedValue({ _id: "c1", save: jest.fn() });
      Message.create.mockResolvedValue({ _id: "m1" });

      const res = await request(app)
        .post("/api/messages/events/e1/to/att1")
        .set("user", JSON.stringify(organizer))
        .send({ text: "Hello" });

      expect(res.status).toBe(201);
      expect(enqueueNotificationJob).toHaveBeenCalled();
    });
  });

  describe("broadcastMessageToAttendees", () => {
    it("returns 400 when text is missing", async () => {
      const res = await request(app)
        .post("/api/messages/events/e1/broadcast-inbox")
        .set("user", JSON.stringify(organizer))
        .send({});

      expect(res.status).toBe(400);
    });

    it("broadcasts message to attendees", async () => {
      Event.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "e1",
          organizer: { name: "Org" },
          attendees: [{ user: "att1" }, { user: "att2" }],
        }),
      });

      Conversation.findOne.mockResolvedValue(null);
      Conversation.create.mockResolvedValue({ _id: "c1", save: jest.fn() });
      Message.create.mockResolvedValue({ _id: "m1" });

      const res = await request(app)
        .post("/api/messages/events/e1/broadcast-inbox")
        .set("user", JSON.stringify(organizer))
        .send({ text: "Hello all" });

      expect(res.status).toBe(201);
      expect(Message.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("getInbox", () => {
    it("returns inbox with unread count", async () => {
      Conversation.find.mockReturnValue({
        populate: () => ({
          populate: () => ({
            populate: () => ({
              sort: jest.fn().mockResolvedValue([
                { _id: "c1", toObject: () => ({ _id: "c1" }) },
              ]),
            }),
          }),
        }),
      });

      Message.countDocuments.mockResolvedValue(2);

      const res = await request(app)
        .get("/api/messages/inbox")
        .set("user", JSON.stringify(attendee));

      expect(res.status).toBe(200);
      expect(res.body[0].unreadCount).toBe(2);
    });
  });

  describe("getConversationMessages", () => {
    it("returns 404 if conversation not found", async () => {
      Conversation.findById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/messages/conversations/c1")
        .set("user", JSON.stringify(attendee));

      expect(res.status).toBe(404);
    });

    it("returns messages for valid user", async () => {
      Conversation.findById.mockResolvedValue({
        _id: "c1",
        attendee: attendee.id,
        organizer: "org1",
      });

      Message.find.mockReturnValue({
        populate: () => ({
          populate: () => ({
            sort: jest.fn().mockResolvedValue([{ text: "Hello" }]),
          }),
        }),
      });

      Message.updateMany.mockResolvedValue({});

      const res = await request(app)
        .get("/api/messages/conversations/c1")
        .set("user", JSON.stringify(attendee));

      expect(res.status).toBe(200);
    });
  });
});
