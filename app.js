const express = require('express')
require('express-async-errors')
const app = express()
const blogsRouter = require('./controllers/blogs')
const cors = require('cors')
const mongoose = require('mongoose');
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, config.mongoOptions)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.use(middleware.errorHandler)

module.exports = app