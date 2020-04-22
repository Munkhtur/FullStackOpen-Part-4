const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body;

  const salt = 10;
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    name,
    passwordHash,
  });
  try {
    const savedUser = await user.save();
    res.json(savedUser.toJSON());
  } catch (error) {
    res.status(400).json({
      error: '`username` to be unique',
    });
  }
});

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { author: 1, likes: 1 });
  res.json(users.map((u) => u.toJSON()));
});

module.exports = usersRouter;
