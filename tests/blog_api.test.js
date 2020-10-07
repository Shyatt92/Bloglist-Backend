const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)

beforeAll(async () => {
  await helper.databaseSeed()
})

describe('when there is initially one user in db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'shyatt',
      name: 'Steve Hyatt',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper status code and message is username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails when username is not given', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Joe Bloggs',
      password: 'bloggs'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('username or password missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails when password is not given', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bloggsy',
      name: 'Joe Bloggs'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('username or password missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails when username is not of required length', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'jb',
      name: 'Joe Bloggs',
      password: 'bloggs'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('invalid username or password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails when password is not of required length', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Bloggsy',
      name: 'Joe Bloggs',
      password: 'jb'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('invalid username or password')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
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
    const user = {
      username: 'root',
      password: 'sekret'
    }
    
    const newBlog = {
      title: 'Steve\'s First Blog',
      author: 'Steve Hyatt',
      url: 'firstblog.steve.hyatt',
      likes: 4
    }

    const login = await api
      .post('/api/login')
      .send(user)
      .expect(200)

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: `bearer ${login.body.token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain('Steve\'s First Blog')
  })

  test('defaults the value of likes to zero when omitted', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }
    
    const newBlog = {
      title: 'Steve\'s Second Blog',
      author: 'Steve Hyatt',
      url: 'secondblog.steve.hyatt',
    }

    const login = await api
      .post('/api/login')
      .send(user)
      .expect(200)

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: `bearer ${login.body.token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('without required fields is not added', async () => {
    const blogsAtStart = await helper.blogsInDb()
    
    const user = {
      username: 'root',
      password: 'sekret'
    }
    
    const newBlog = {
      author: 'Steve Hyatt',
      likes: 4
    }

    const login = await api
      .post('/api/login')
      .send(user)
      .expect(200)

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ authorization: `bearer ${login.body.token}` })
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('without required authorization token fails with 401 status code', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const newBlog = {
      title: 'Steve\'s Third Blog',
      author: 'Steve Hyatt',
      url: 'thirdblog.steve.hyatt',
      likes: 40
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

describe('HTTP DELETE requests', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const user = {
      username: 'root',
      password: 'sekret'
    }

    const login = await api
      .post('/api/login')
      .send(user)
      .expect(200)

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ authorization: `bearer ${login.body.token} `})
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('HTTP PUT requests', () => {
  test('successfully updates likes with status code 200', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      id: blogToUpdate.id,
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 1000000,
      user: blogToUpdate.user.toString()
    }

    const result = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(1000000)
    expect(result.body).toEqual(newBlog)
  })
})



afterAll(() => {
  mongoose.connection.close()
})