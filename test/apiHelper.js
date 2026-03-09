const Blog = require("../models/blog");
const User = require("../models/user");

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

const notExistingId = async () => {
  const blog = new Blog({
    title: "to delete",
    url: "http://todelete",
  });

  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsAtDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = { initialBlogs, notExistingId, blogsAtDb };
