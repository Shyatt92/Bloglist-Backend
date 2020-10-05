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

describe('HTTP DELETE requests', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('HTTP PUT requests', () => {
  test('successfully updates likes with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 27
    }

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(27)
    expect(result.body).toEqual(newBlog)
  })
})

afterAll(() => {
  mongoose.connection.close()
})