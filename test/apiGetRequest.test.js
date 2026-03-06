const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const helper = require("./apiHelper");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("GET /api/blogs", () => {
  test("return blogs as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("check the length", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test("check the id field", async () => {
    const response = await api.get("/api/blogs");

    assert(
      response.body.every((blog) => blog.id),
      "Not all blogs have an id field",
    );
  });
});

describe("GET /api/blogs/id", () => {
  test("succeeds with a valid id", async () => {
    const blogs = await helper.blogsAtDb();
    const blogToView = blogs[0];

    await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("fails with statuscode 404 if note does not exist", async () => {
    const validNonexistingId = await helper.notExistingId();

    await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";
    await api.get(`/api/blogs/${invalidId}`).expect(400);
  });
});

describe("POST /api/blogs", () => {
  test("check that blog is created", async () => {
    const newBlog = {
      title: "Third blog",
      author: "Dmitry Erofeev",
      url: "https://example.com/first-blog",
      likes: 2,
    };

    const addedBlog = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsAtDb();

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert.strictEqual(addedBlog.body.title, newBlog.title);
  });

  test("check that likes default to 0", async () => {
    const newBlog = {
      title: "Third blog",
      author: "Dmitry Erofeev",
      url: "https://example.com/first-blog",
    };

    const addedBlog = await api.post("/api/blogs").send(newBlog);

    assert.strictEqual(addedBlog.body.likes, 0);
  });

  test("status 400 (Bad Request) if no title", async () => {
    const newBlog = {
      author: "Dmitry Erofeev",
      url: "https://example.com/first-blog",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("status 400 (Bad Request) if no url", async () => {
    const newBlog = {
      title: "Third blog",
      author: "Dmitry Erofeev",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

describe("DELETE /api/blogs/id", async () => {
  test("succeed with statuscode 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsAtDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsAtDb();

    const ids = blogsAtEnd.map((blog) => blog.id);
    assert(!ids.includes(blogToDelete.id));

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
  });
});

describe.only("PUT /api/blogs/id", async () => {
  test("succeed blog changed", async () => {
    const blogsAtStart = await helper.blogsAtDb();
    const blogToPut = blogsAtStart[0];

    await api
      .put(`/api/blogs/${blogToPut.id}`)
      .send({ ...blogToPut, likes: blogToPut.likes + 1 })
      .expect(200);

    const blogsAtEnd = await helper.blogsAtDb();
    const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToPut.id);

    assert.strictEqual(updatedBlog.id, blogToPut.id)
    assert.strictEqual(updatedBlog.likes, blogToPut.likes + 1);
  });
});

after(async () => {
  await mongoose.connection.close();
});
