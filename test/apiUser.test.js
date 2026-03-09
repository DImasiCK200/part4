const assert = require("node:assert");
const bcrypt = require("bcrypt");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const helper = require("./apiHelper");

const api = supertest(app);

describe.only("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("success adding new user", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "test",
      name: "Test",
      password: "12345",
    };

    await api
      .post("/api/users/")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("fails if username less than 3 symbols", async () => {
    const newUser = {
      username: "te",
      name: "Test",
      password: "12345",
    };

    const response = await api.post("/api/users/").send(newUser).expect(400);

    assert(response.body.error);
  });

  test("fails if password less than 3 symbols", async () => {
    const newUser = {
      username: "test",
      name: "Test",
      password: "12",
    };

    const response = await api.post("/api/users/").send(newUser).expect(400);

    assert(response.body.error);
  });

  test("get users return json", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("get users return array of users without passwordHash", async () => {
    const response = await api.get("/api/users");
    const users = response.body;

    assert(Array.isArray(users));
    assert(users.every((u) => !u.passwordHash));
  });
});

after(async () => {
  await mongoose.connection.close();
});
