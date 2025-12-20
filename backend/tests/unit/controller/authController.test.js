// 🔴 Redis & notification ko mock (VERY IMPORTANT)
jest.mock("../../../config/redis", () => ({
  redisClient: {
    publish: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock("../../../services/notificationService", () => ({
  startSubscriber: jest.fn(),
}));

const request = require("supertest");
const app = require("../../../app");
const User = require("../../../models/User");

jest.mock("../../../models/User");

describe("AUTH CONTROLLER - REGISTER USER", () => {

  // ❌ USER ALREADY EXISTS
  it("should return error if user already exists", async () => {

    User.findOne.mockResolvedValueOnce(true);

    const response = await request(app)
      .post("/api/auth/register-user")
      .send({
        name: "Tani",
        email: "tani@gmail.com",
        password: "1234",
      });

    expect(response.status).toBe(400);

    // controller returns JSON string → {"msg":"User already exists"}
    const body = JSON.parse(response.text);
    expect(body.msg).toBe("User already exists");
  });

  // ✅ SUCCESSFUL REGISTRATION
  it("should register new user successfully", async () => {

    User.findOne.mockResolvedValueOnce(null);

    User.create.mockResolvedValueOnce({
      name: "Tani",
      email: "tani@gmail.com",
    });

    const response = await request(app)
      .post("/api/auth/register-user")
      .send({
        name: "Tani",
        email: "tani@gmail.com",
        password: "1234",
      });

    // ⚠️ controller sirf 200 + some response bhejta hai
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

});
