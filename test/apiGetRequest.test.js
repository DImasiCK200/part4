const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");

const api = supertest(app);

const initialBlogs = [
  {
    title: "First blog",
    author: "John Doe",
    url: "https://example.com/first-blog",
    likes: 5,
  },
  {
    title: "Second blog",
    author: "Jane Smith",
    url: "https://example.com/second-blog",
    likes: 10,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
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

    assert.strictEqual(response.body.length, initialBlogs.length);
  });

  test("check the id field", async () => {
    const response = await api.get("/api/blogs");

    assert(
      response.body.every((blog) => blog.id),
      "Not all blogs have an id field",
    );
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

    const blogsAtEnd = await Blog.find({});

    assert.strictEqual(blogsAtEnd.length, initialBlogs.length + 1);
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

  test.only("check that error if no title", async () => {
    const newBlog = {
      author: "Dmitry Erofeev",
      url: "https://example.com/first-blog",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test.only("check that error if no url", async () => {
    const newBlog = {
      title: "Third blog",
      author: "Dmitry Erofeev",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
