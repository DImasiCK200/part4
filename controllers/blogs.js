const blogRouter = require("express").Router();
const Blog = require("../models/blog");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});

  response.json(blogs);
});

blogRouter.get("/:id", async (request, response, next) => {
  const id = request.params.id;

  if (id.length < 23) {
    response.status(400).end();
  }

  const blog = await Blog.findById(request.params.id);

  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

blogRouter.post("/", async (request, response, next) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });

  const savedBlog = await blog.save();

  response.status(201).json(savedBlog);
});

blogRouter.put("/:id", async (request, response, next) => {
  const { title, author, url, likes } = request.body;

  const blog = await Blog.findById(request.params.id);

  if (blog) {
    blog.title = title;
    blog.author = author;
    blog.url = url;
    blog.likes = likes;

    const updatedBlog = await blog.save();
    response.json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

blogRouter.delete("/:id", async (request, response, next) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogRouter;
