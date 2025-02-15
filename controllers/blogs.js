const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
  })
  
blogsRouter.post('/', async (request, response) => {

    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if(!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      url: body.url,
      title: body.title,
      author: user.username,
      user: user.id,
      likes: body.likes || 0
    })

    if(!body.title || !body.url){
      return response.status(400).json({ error: 'title and url are required' })
    }

    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    await user.save()

    response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(id, { likes }, { new: true, runValidators: true, context: 'query' })
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
