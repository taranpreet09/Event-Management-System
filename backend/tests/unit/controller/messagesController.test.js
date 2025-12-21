// tests/unit/controller/messagesController.test.js

jest.mock("../../../utils/queue", () => ({
  enqueueNotificationJob: jest.fn(),
}));

// In case any imported module touches Redis, keep it mocked
jest.mock("../../../config/redis", () => ({
  redisClient: {
    publish: jest.fn(),
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
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

// Minimal Express app wiring the controller endpoints
const app = express();
app.use(bodyParser.json());

// Simple auth stub: put a JSON user object in `req.user` via `user` header
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

const organizerUser = { id: "org1", role: "organizer", name: "Organizer" };
const attendeeUser = { id: "att1", role: "user", name: "Attendee" };

describe("MESSAGES CONTROLLER", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessageToAttendee", () => {
    it("should return 400 if text is missing", async () => {
      const res = await request(app)
        .post("/api/messages/events/event1/to/att1")
        .set("user", JSON.stringify(organizerUser))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Text is required");
    });

    it("should return 404 if event is not found", async () => {
      const populate = jest.fn().mockResolvedValue(null);
      Event.findById.mockReturnValue({ populate });

      const res = await request(app)
        .post("/api/messages/events/event1/to/att1")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello" });

      expect(Event.findById).toHaveBeenCalledWith("event1");
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe("Event not found");
    });

    it("should return 400 if target user is not an attendee of the event", async () => {
      const eventDoc = {
        _id: "event1",
        organizer: { name: "Org" },
        attendees: [{ user: "someone-else" }],
      };

      const populate = jest.fn().mockResolvedValue(eventDoc);
      Event.findById.mockReturnValue({ populate });

      const res = await request(app)
        .post("/api/messages/events/event1/to/att1")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello" });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Target user is not an attendee of this event.");
    });

    it("should return 404 if attendee user is not found", async () => {
      const eventDoc = {
        _id: "event1",
        organizer: { name: "Org" },
        attendees: [{ user: "att1" }],
      };
      const populate = jest.fn().mockResolvedValue(eventDoc);
      Event.findById.mockReturnValue({ populate });

      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/messages/events/event1/to/att1")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello" });

      expect(User.findById).toHaveBeenCalledWith("att1");
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe("Attendee not found");
    });

    it("should send message to attendee successfully", async () => {
      const eventDoc = {
        _id: "event1",
        organizer: { name: "Org" },
        attendees: [{ user: "att1" }],
      };
      const populate = jest.fn().mockResolvedValue(eventDoc);
      Event.findById.mockReturnValue({ populate });

      const attendeeDoc = { _id: "att1" };
      User.findById.mockResolvedValue(attendeeDoc);

      const convoSave = jest.fn().mockResolvedValue(true);
      const convoDoc = { _id: "convo1", save: convoSave };
      Conversation.findOne.mockResolvedValue(convoDoc);

      const messageDoc = { _id: "msg1", text: "Hello" };
      Message.create.mockResolvedValue(messageDoc);

      const res = await request(app)
        .post("/api/messages/events/event1/to/att1")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello" });

      expect(res.status).toBe(201);
      expect(res.body.msg).toBe("Message sent");
      expect(Message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversation: "convo1",
          from: organizerUser.id,
          to: "att1",
          text: "Hello",
        })
      );
      expect(convoSave).toHaveBeenCalled();
      expect(enqueueNotificationJob).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "INBOX_MESSAGE",
          toUserId: "att1",
          eventId: "event1",
          conversationId: "convo1",
          organizerName: "Org",
          text: "Hello",
        })
      );
    });
  });

  describe("broadcastMessageToAttendees", () => {
    it("should return 400 if text is missing", async () => {
      const res = await request(app)
        .post("/api/messages/events/event1/broadcast-inbox")
        .set("user", JSON.stringify(organizerUser))
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Text is required");
    });

    it("should return 404 if event is not found", async () => {
      const populate = jest.fn().mockResolvedValue(null);
      Event.findById.mockReturnValue({ populate });

      const res = await request(app)
        .post("/api/messages/events/event1/broadcast-inbox")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello all" });

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe("Event not found");
    });

    it("should return 400 if event has no attendees", async () => {
      const eventDoc = {
        _id: "event1",
        organizer: { name: "Org" },
        attendees: [],
      };
      const populate = jest.fn().mockResolvedValue(eventDoc);
      Event.findById.mockReturnValue({ populate });

      const res = await request(app)
        .post("/api/messages/events/event1/broadcast-inbox")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello all" });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("No attendees to message for this event.");
    });

    it("should broadcast message to all attendees", async () => {
      const eventDoc = {
        _id: "event1",
        organizer: { name: "Org" },
        attendees: [{ user: "att1" }, { user: "att2" }],
      };
      const populate = jest.fn().mockResolvedValue(eventDoc);
      Event.findById.mockReturnValue({ populate });

      const convoDoc = { _id: "convo1", save: jest.fn().mockResolvedValue(true) };
      Conversation.findOne.mockResolvedValue(null);
      Conversation.create.mockResolvedValue(convoDoc);

      Message.create.mockResolvedValue({ _id: "msg1" });

      const res = await request(app)
        .post("/api/messages/events/event1/broadcast-inbox")
        .set("user", JSON.stringify(organizerUser))
        .send({ text: "Hello all" });

      expect(res.status).toBe(201);
      expect(res.body.msg).toBe("Inbox message sent to all attendees.");
      expect(Message.create).toHaveBeenCalledTimes(2);
      expect(enqueueNotificationJob).toHaveBeenCalledTimes(2);
    });
  });

  describe("getInbox", () => {
    it("should return conversations with unreadCount", async () => {
      const mockConvoDoc = {
        _id: "convo1",
        toObject: () => ({
          _id: "convo1",
          some: "data",
        }),
      };

      const sort = jest.fn().mockResolvedValue([mockConvoDoc]);
      const populate3 = jest.fn().mockReturnValue({ sort });
      const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
      const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
      Conversation.find.mockReturnValue({ populate: populate1 });

      Message.countDocuments.mockResolvedValue(3);

      const res = await request(app)
        .get("/api/messages/inbox")
        .set("user", JSON.stringify(attendeeUser));

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]._id).toBe("convo1");
      expect(res.body[0].unreadCount).toBe(3);
    });
  });

  describe("getConversationMessages", () => {
    it("should return 404 if conversation is not found", async () => {
      Conversation.findById.mockResolvedValue(null);

      const res = await request(app)
        .get("/api/messages/conversations/convo1")
        .set("user", JSON.stringify(attendeeUser));

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe("Conversation not found");
    });

    it("should return 403 if user is not part of the conversation", async () => {
      const convoDoc = {
        _id: "convo1",
        attendee: "someone-else",
        organizer: "some-organizer",
      };
      Conversation.findById.mockResolvedValue(convoDoc);

      const res = await request(app)
        .get("/api/messages/conversations/convo1")
        .set("user", JSON.stringify(attendeeUser));

      expect(res.status).toBe(403);
      expect(res.body.msg).toBe("You are not part of this conversation.");
    });

    it("should return messages and mark them as read for authorized user", async () => {
      const convoDoc = {
        _id: "convo1",
        attendee: attendeeUser.id,
        organizer: "org1",
      };
      Conversation.findById.mockResolvedValue(convoDoc);

      const mockMessages = [{ _id: "m1", text: "hello" }];
      const sort = jest.fn().mockResolvedValue(mockMessages);
      const populateTo = jest.fn().mockReturnValue({ sort });
      const populateFrom = jest.fn().mockReturnValue({ populate: populateTo });
      Message.find.mockReturnValue({ populate: populateFrom });

      Message.updateMany.mockResolvedValue({ nModified: 1 });

      const res = await request(app)
        .get("/api/messages/conversations/convo1")
        .set("user", JSON.stringify(attendeeUser));

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMessages);
      expect(Message.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          conversation: "convo1",
          to: attendeeUser.id,
        }),
        expect.objectContaining({
          $set: { readAt: expect.any(Date) },
        })
      );
    });
  });
});
