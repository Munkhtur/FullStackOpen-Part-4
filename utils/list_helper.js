const _ = require('lodash');
const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const array = blogs.map((blog) => blog.likes);
  return array.reduce((sum, item) => sum + item, 0);
};

const favoriteBlog = (arr) => {
  let array = arr.map((a) => a.likes);
  var max = array.reduce(function (a, b) {
    return Math.max(a, b);
  });
  const fav = arr.find((blog) => blog.likes === max);
  return fav;
};

const mostBlog = (blogs) => {
  const b = _.groupBy(blogs, 'author');

  const array = b[Object.keys(b)[Object.keys(b).length - 1]];
  const author = array[0].author;
  const blogNum = array.length;

  const obj = {
    author: author,
    blogs: blogNum,
  };

  return obj;
};

const mostLikes = (blogs) => {
  const b = _.groupBy(blogs, 'author');
  const authorsArr = [];
  _.forOwn(b, (value, key) => {
    const totalLikes = value.reduce((pre, curr) => {
      return pre + curr.likes;
    }, 0);
    const obj = {
      author: key,
      likes: totalLikes,
    };
    authorsArr.push(obj);
  });
  return favoriteBlog(authorsArr);
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlog, mostLikes };
