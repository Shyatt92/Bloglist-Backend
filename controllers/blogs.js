const blogsRouter = require('express').Router();
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  })

  const savedBlog = await blog.save()
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