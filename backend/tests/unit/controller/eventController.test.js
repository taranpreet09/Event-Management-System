// tests/unit/controller/eventController.test.js

jest.mock("../../../utils/queue", () => ({
  enqueueEmailJob: jest.fn(),
  enqueueNotificationJob: jest.fn(),
}));

jest.mock("../../../config/redis", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const eventsController = require("../../../controllers/eventsController");
const Event = require("../../../models/Event");
const User = require("../../../models/User");
const { redisClient } = require("../../../config/redis");
const {
  enqueueEmailJob,
  enqueueNotificationJob,
} = require("../../../utils/queue");

// Mock Mongoose models
jest.mock("../../../models/Event");
jest.mock("../../../models/User");

// Express app setup
const app = express();
app.use(bodyParser.json());

// Mock auth middleware
app.use((req, res, next) => {
  if (req.headers.user) {
    req.user = JSON.parse(req.headers.user);
  }
  next();
});

// Routes
app.get("/api/events", eventsController.getAllEvents);
app.post("/api/events", eventsController.createEvent);
app.post("/api/events/register/:id", eventsController.registerForEvent);
app.delete("/api/events/:id", eventsController.deleteEvent);

// Mock data
const mockOrganizer = { id: "orgid", role: "organizer", name: "Org1" };
const mockUser = { id: "userid", role: "user", name: "User1", email: "u@test.com" };

const mockEvents = [{ title: "Event1" }];

const mockEvent = {
  _id: "eventid",
  title: "Event1",
  organizer: "orgid",
  attendees: [],
  registrationDeadline: new Date(Date.now() + 100000),
  capacity: 100,
  createRegistrationToken: jest.fn().mockReturnValue("token123"),
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue(true),
};

// Model mocks
Event.findById.mockImplementation((id) =>
  id === mockEvent._id ? Promise.resolve(mockEvent) : Promise.resolve(null)
);

User.findById.mockResolvedValue(mockUser);

describe("EVENT CONTROLLER - ESSENTIAL TESTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return events from DB if cache miss", async () => {
    redisClient.get.mockResolvedValue(null);

    /**
     * Controller does:
     * Event.find().sort().populate().populate()
     * NO exec()
     */
    const populateSecond = jest.fn().mockResolvedValue(mockEvents);
    const populateFirst = jest.fn().mockReturnValue({
      populate: populateSecond,
    });
    const sort = jest.fn().mockReturnValue({
      populate: populateFirst,
    });

    Event.find.mockReturnValue({ sort });

    const res = await request(app)
      .get("/api/events")
      .set("user", JSON.stringify(mockUser));

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockEvents);
    expect(redisClient.set).toHaveBeenCalled();
  });

  it("should create event if user is organizer", async () => {
    const eventData = {
      title: "Event1",
      shortDescription: "Short",
      description: "Desc",
      type: "online",
      category: "Tech",
      date: new Date(Date.now() + 3600000).toISOString(),
      registrationDeadline: new Date(Date.now() + 1800000).toISOString(),
      location: "Zoom",
      coverImageUrl: "url",
      capacity: 100,
    };

    Event.prototype.save = jest.fn().mockResolvedValue(eventData);

    const res = await request(app)
      .post("/api/events")
      .send(eventData)
      .set("user", JSON.stringify(mockOrganizer));

    expect(res.status).toBe(200);
    expect(enqueueNotificationJob).toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalled();
  });

  it("should register a user for an event", async () => {
    const res = await request(app)
      .post(`/api/events/register/${mockEvent._id}`)
      .set("user", JSON.stringify(mockUser));

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Successfully registered/i);
    expect(enqueueEmailJob).toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalled();
  });

  it("should delete event if organizer is authorized", async () => {
    Event.findById.mockResolvedValue(mockEvent);
    Event.findByIdAndDelete.mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/events/${mockEvent._id}`)
      .set("user", JSON.stringify(mockOrganizer));

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/Event removed/i);
    expect(enqueueNotificationJob).toHaveBeenCalled();
    expect(redisClient.del).toHaveBeenCalled();
  });
  it("should NOT create event if user is not organizer", async () => {
  const eventData = {
    title: "Unauthorized Event",
    shortDescription: "Short",
    description: "Desc",
    type: "online",
    category: "Tech",
    date: new Date(Date.now() + 3600000).toISOString(),
    registrationDeadline: new Date(Date.now() + 1800000).toISOString(),
    location: "Zoom",
    coverImageUrl: "url",
    capacity: 100,
  };

  const res = await request(app)
    .post("/api/events")
    .send(eventData)
    .set("user", JSON.stringify(mockUser)); // 👈 NOT organizer

  expect(res.status).toBe(403);
  expect(res.body.msg || res.text).toMatch(/not authorized|permission|access/i);
});

});
