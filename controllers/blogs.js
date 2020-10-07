const blogsRouter = require('express').Router();
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1, id: 1 })

  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const users = await User.find({})
  const user = users[Math.floor(Math.random() * users.length)]
  
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
  await Blog.findByIdAndRemove(request.params.blogId)

  response.status(204).end()
})

module.exports = blogsRouter