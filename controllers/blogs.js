const blogsRouter = require('express').Router();
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1 })

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  if (savedBlog) {
    response.status(201).json(savedBlog)
  } else {
    response.status(400).end()
  }
})

blogsRouter.put('/:blogId', async (request, response) => {
  const body = request.body
  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.blogId, newBlog, { new: true })
  response.status(200).json(updatedBlog)
})

blogsRouter.delete('/:blogId', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.blogId)

  if (blog.user.id !== decodedToken.id) {
    return response.status(401).json({ error: 'not authorized' })
  }

  await Blog.removeOne({ _id: blog.id })
  const user = await User.findById(decodedToken.id)

  user.blogs = user.blogs.filter(b => b !== blog.id)
  await user.save()

  response.status(204).end()
})

module.exports = blogsRouter