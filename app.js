const express = require('express')
const app = express()
const appRouter = require('./controllers/blogs')
const cors = require('cors')
const mongoose = require('mongoose');
const config = require('./utils/config')
const logger = require('./utils/logger')

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

app.use('/api/blogs', appRouter)

module.exports = app