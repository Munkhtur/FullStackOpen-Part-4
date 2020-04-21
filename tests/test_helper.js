const Blog = require('../models/blog');

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'first author',
    urel: 'sdjkurf.com',
    likes: 2,
  },
  {
    title: 'Initial second',
    author: 'second author',
    urel: 'sdjkurff',
    likes: 3,
  },
];

const nonExistingId = async () => {
  const blog = new Note({ title: 'willremovethissoon' });
  await blog.save();
  await blog.remove();

  return blog.id;
};

const blogInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogInDb,
};
