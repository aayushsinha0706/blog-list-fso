const mongoose = require('mongoose')
const Blog = require('../models/blog')


const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 8
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 26
  }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog =>  blog.toJSON())
}

const createMockBlogAndFormat = (data) => {
  const mockBlog = new Blog({
    title: data.title,
    author: data.author,
    url: data.url,
    likes: data.likes || 0
  })

  mockBlog._id = mongoose.Types.ObjectId
  mockBlog.__v = 0

  return mockBlog.toJSON()
}

module.exports = {
    initialBlogs,
    blogsInDb,
    createMockBlogAndFormat
}