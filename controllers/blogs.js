const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { name: 1, username: 1 });
  response.json(blogs.map((blog) => blog.toJSON()));
});

blogsRouter.post('/', async (request, response) => {
  const body = request.body;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  if (!body.title || !body.url) {
    response.send(400);
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.json(savedBlog.toJSON);
});

blogsRouter.put('/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true });
  res.json(updatedBlog.toJSON());
});

blogsRouter.delete('/:id', async (req, res) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  console.log(decodedToken, 'decodedtoken');
  console.log(decodedToken.id, 'decodedtoken id');
  const id = req.params.id;
  console.log(id, 'blog id');
  const blogToDelete = await Blog.findById(id);
  const ownerOfBlog = blogToDelete.user;
  console.log(blogToDelete, 'blog to delete object');
  console.log(ownerOfBlog, 'owner of blog');
  console.log(ownerOfBlog._id, 'owner of blog _id');
  if (ownerOfBlog._id.toString() === decodedToken.id.toString()) {
    await blogToDelete.deleteOne();
    res.status(200).json({ message: `Blog deleted` });
  } else {
    res.status(401).json({ error: 'User not authorized' });
  }

  // await Blog.findByIdAndRemove(id);
  // res.status(204).end();
});

module.exports = blogsRouter;
