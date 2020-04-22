const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');
const helper = require('./test_helper');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
let token;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('sekret', 10);
  const user = new User({ username: 'root', name: 'rooot', passwordHash });
  await user.save();

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe('get and create', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('there are two notes', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/blogs');
    const contents = response.body.map((r) => r.title);

    expect(contents).toContain('HTML is easy');
  });

  test('a valid blog can be added', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' });
    token = result.body.token;
    console.log(result.body.token);

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Third author',
      url: 'test form a valid blog',
      likes: 3,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const contents = blogsAtEnd.map((r) => r.title);
    expect(contents).toContain('async/await simplifies making async calls');
  });

  test('blogs id is not in _id format', async () => {
    const blogsAtEnd = await helper.blogInDb();
    const blog = blogsAtEnd[0];
    console.log(blog);
    expect(blog.id).toBeDefined();
  });

  test('like missing is 0', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' });
    token = result.body.token;

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'author likes 0',
      url: 'likes missoing',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
    console.log(blogsAtEnd[2].likes);
    expect(blogsAtEnd[2].likes).toBe(0);
    //   const contents = blogsAtEnd.map((r) => r.title);
    //   expect(contents).toContain('');
  });

  test('title missing', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' });
    token = result.body.token;

    const newBlog = {
      author: 'author likes 0',
      url: 'likes missoing',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });
  test('unauthorized blog', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'notroot', password: 'sekret' });
    token = 'notvalidtoken';

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'author likes 0',
      url: 'likes missoing',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});

describe('delete method', () => {
  test('delete valid', async () => {
    const blogsAtStart = await helper.blogInDb();
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' });
    token = result.body.token;

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'author likes 0',
      url: 'likes missoing',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`);

    const blogToDelete = blogsAtStart[2];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAtEnd.map((t) => t.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});
describe('update methods', () => {
  test('update likes', async () => {
    const blogsAtStart = await helper.blogInDb();
    const blogToUpdate = blogsAtStart[0];
    const newBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1,
    };

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);

    const blogsAtEnd = await helper.blogInDb();
    const updatedBlog = blogsAtEnd[0];

    expect(updatedBlog.likes).toBe(blogToUpdate.likes + 1);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
