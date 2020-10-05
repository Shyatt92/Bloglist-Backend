const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for(let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('HTTP GET requests', () => {
  test('return notes in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('return an object with a unique identifier property', async () => {
    const response = await api.get('/api/blogs')
    
    expect(response.body[0].id).toBeDefined()
  })
})

describe('HTTP POST requests', () => {
  test('successfully creates a new blog post', async () => {
    const newBlog = {
      title: 'Steve\'s First Blog',
      author: 'Steve Hyatt',
      url: 'firstblog.steve.hyatt',
      likes: 4
    }
    
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('Steve\'s First Blog')
  })

  test('defaults the value of likes to zero when omitted', async () => {
    const newBlog = {
      title: 'Steve\'s Second Blog',
      author: 'Steve Hyatt',
      url: 'secondblog.steve.hyatt',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('without required fields is not added', async () => {
    const newBlog = {
      author: 'Steve Hyatt',
      likes: 4
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})